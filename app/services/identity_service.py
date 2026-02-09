"""Business logic for identity CRUD operations."""

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.identity import Preference, PronounSet, User, Visibility
from app.schemas.identity import (
    IdentityCreate,
    IdentityUpdate,
    PreferenceCreate,
    PronounSetCreate,
)


async def create_identity(session: AsyncSession, payload: IdentityCreate) -> User:
    """Create a new user identity with optional pronouns and preferences."""
    user = User(email=payload.email, display_name=payload.display_name)
    session.add(user)
    await session.flush()  # get user.id

    for ps in payload.pronoun_sets:
        pronoun_set = PronounSet(
            user_id=user.id,
            subject=ps.subject,
            object=ps.object,
            possessive=ps.possessive,
            possessive_pronoun=ps.possessive_pronoun,
            reflexive=ps.reflexive,
            is_primary=ps.is_primary,
        )
        session.add(pronoun_set)

    if payload.preference:
        pref = Preference(
            user_id=user.id,
            title=payload.preference.title,
            visibility=payload.preference.visibility,
            language_preference=payload.preference.language_preference,
        )
        session.add(pref)

    await session.commit()
    return await get_identity(session, user.id)  # type: ignore[return-value]


async def get_identity(session: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Fetch a single identity by ID, eagerly loading relationships."""
    stmt = (
        select(User)
        .where(User.id == user_id)
        .options(selectinload(User.pronoun_sets), selectinload(User.preference))
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def get_identity_by_email(session: AsyncSession, email: str) -> User | None:
    """Fetch a single identity by email."""
    stmt = (
        select(User)
        .where(User.email == email)
        .options(selectinload(User.pronoun_sets), selectinload(User.preference))
    )
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def list_identities(
    session: AsyncSession, offset: int = 0, limit: int = 50
) -> list[User]:
    """Return a paginated list of identities."""
    stmt = (
        select(User)
        .options(selectinload(User.pronoun_sets), selectinload(User.preference))
        .offset(offset)
        .limit(limit)
        .order_by(User.display_name)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def update_identity(
    session: AsyncSession, user_id: uuid.UUID, payload: IdentityUpdate
) -> User | None:
    """Update mutable fields on an identity."""
    user = await get_identity(session, user_id)
    if user is None:
        return None
    if payload.display_name is not None:
        user.display_name = payload.display_name
    await session.commit()
    return await get_identity(session, user_id)


async def delete_identity(session: AsyncSession, user_id: uuid.UUID) -> bool:
    """Delete an identity and all associated data. Returns True if deleted."""
    user = await get_identity(session, user_id)
    if user is None:
        return False
    await session.delete(user)
    await session.commit()
    return True


# ---------------------------------------------------------------------------
# Pronoun-specific helpers
# ---------------------------------------------------------------------------


async def get_pronoun_sets(
    session: AsyncSession, user_id: uuid.UUID
) -> list[PronounSet]:
    stmt = select(PronounSet).where(PronounSet.user_id == user_id)
    result = await session.execute(stmt)
    return list(result.scalars().all())


async def replace_pronoun_sets(
    session: AsyncSession,
    user_id: uuid.UUID,
    pronoun_sets: list[PronounSetCreate],
) -> list[PronounSet]:
    """Replace all pronoun sets for a user."""
    # Delete existing
    existing = await get_pronoun_sets(session, user_id)
    for ps in existing:
        await session.delete(ps)
    await session.flush()

    # Create new
    new_sets = []
    for ps in pronoun_sets:
        pset = PronounSet(
            user_id=user_id,
            subject=ps.subject,
            object=ps.object,
            possessive=ps.possessive,
            possessive_pronoun=ps.possessive_pronoun,
            reflexive=ps.reflexive,
            is_primary=ps.is_primary,
        )
        session.add(pset)
        new_sets.append(pset)

    await session.commit()
    return new_sets


# ---------------------------------------------------------------------------
# Preference helpers
# ---------------------------------------------------------------------------


async def update_preference(
    session: AsyncSession,
    user_id: uuid.UUID,
    payload: PreferenceCreate,
) -> Preference:
    """Upsert the preference row for a user."""
    stmt = select(Preference).where(Preference.user_id == user_id)
    result = await session.execute(stmt)
    pref = result.scalar_one_or_none()

    if pref is None:
        pref = Preference(user_id=user_id)
        session.add(pref)

    pref.title = payload.title
    pref.visibility = payload.visibility
    pref.language_preference = payload.language_preference
    await session.commit()

    # Re-fetch to get updated_at
    result = await session.execute(stmt)
    return result.scalar_one()  # type: ignore[return-value]


# ---------------------------------------------------------------------------
# Lookup helpers used by NLP engine
# ---------------------------------------------------------------------------


async def lookup_by_name(
    session: AsyncSession,
    display_name: str,
    visibility: Visibility = Visibility.INTERNAL,
) -> User | None:
    """Find a user by display name, respecting visibility."""
    stmt = (
        select(User)
        .join(Preference, Preference.user_id == User.id, isouter=True)
        .where(User.display_name.ilike(display_name))
        .options(selectinload(User.pronoun_sets), selectinload(User.preference))
    )
    result = await session.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        return None

    # Check visibility
    if user.preference and _visibility_rank(user.preference.visibility) < _visibility_rank(visibility):
        return None

    return user


def _visibility_rank(v: Visibility) -> int:
    """Higher rank = more permissive."""
    return {
        Visibility.PRIVATE: 0,
        Visibility.TEAM: 1,
        Visibility.INTERNAL: 2,
        Visibility.PUBLIC: 3,
    }[v]
