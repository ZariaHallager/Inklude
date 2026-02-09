"""Curated lexicon of gendered terms mapped to inclusive alternatives.

Each entry contains:
- term: the gendered word/phrase (lowercase for matching)
- alternatives: list of inclusive replacements
- category: classification bucket
- severity: low / medium / high
- note: short educational context
"""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum


class LexiconCategory(str, Enum):
    JOB_TITLE = "job_title"
    SALUTATION = "salutation"
    COLLOQUIALISM = "colloquialism"
    HONORIFIC = "honorific"
    PRONOUN_RELATED = "pronoun_related"
    FAMILIAL = "familial"
    GENDERED_DESCRIPTOR = "gendered_descriptor"
    INSTITUTIONAL = "institutional"
    MARITIME_MILITARY = "maritime_military"
    COMPOUND = "compound"


class Severity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


@dataclass(frozen=True)
class LexiconEntry:
    term: str
    alternatives: list[str] = field(default_factory=list)
    category: LexiconCategory = LexiconCategory.COLLOQUIALISM
    severity: Severity = Severity.LOW
    note: str = ""


# ---------------------------------------------------------------------------
# Master lexicon – ~200+ entries
# ---------------------------------------------------------------------------

_RAW_ENTRIES: list[dict] = [
    # -----------------------------------------------------------------------
    # JOB TITLES  (severity: medium)
    # -----------------------------------------------------------------------
    {"term": "chairman", "alternatives": ["chairperson", "chair"], "category": "job_title", "severity": "medium", "note": "Gender-neutral alternatives are widely adopted in corporate governance."},
    {"term": "chairwoman", "alternatives": ["chairperson", "chair"], "category": "job_title", "severity": "medium", "note": "Gender-neutral alternatives are widely adopted in corporate governance."},
    {"term": "fireman", "alternatives": ["firefighter"], "category": "job_title", "severity": "medium", "note": "Firefighter has been the standard term in fire services since the 1990s."},
    {"term": "policeman", "alternatives": ["police officer", "officer"], "category": "job_title", "severity": "medium", "note": "Police officer is the standard professional term."},
    {"term": "policewoman", "alternatives": ["police officer", "officer"], "category": "job_title", "severity": "medium", "note": "Police officer is the standard professional term."},
    {"term": "mailman", "alternatives": ["mail carrier", "postal worker"], "category": "job_title", "severity": "medium", "note": "The U.S. Postal Service uses 'letter carrier' officially."},
    {"term": "postman", "alternatives": ["mail carrier", "postal worker"], "category": "job_title", "severity": "medium", "note": "Gender-neutral alternatives are preferred in professional contexts."},
    {"term": "salesman", "alternatives": ["salesperson", "sales representative", "sales rep"], "category": "job_title", "severity": "medium", "note": "Salesperson is inclusive and professional."},
    {"term": "saleswoman", "alternatives": ["salesperson", "sales representative", "sales rep"], "category": "job_title", "severity": "medium", "note": "Salesperson is inclusive and professional."},
    {"term": "businessman", "alternatives": ["businessperson", "professional", "executive"], "category": "job_title", "severity": "medium", "note": "Businessperson or professional avoids gendered assumptions."},
    {"term": "businesswoman", "alternatives": ["businessperson", "professional", "executive"], "category": "job_title", "severity": "medium", "note": "Businessperson or professional avoids gendered assumptions."},
    {"term": "congressman", "alternatives": ["congressperson", "member of congress", "representative"], "category": "job_title", "severity": "medium", "note": "Representative or member of Congress is more inclusive."},
    {"term": "congresswoman", "alternatives": ["congressperson", "member of congress", "representative"], "category": "job_title", "severity": "medium", "note": "Representative or member of Congress is more inclusive."},
    {"term": "spokesman", "alternatives": ["spokesperson", "representative"], "category": "job_title", "severity": "medium", "note": "Spokesperson is the standard gender-neutral term."},
    {"term": "spokeswoman", "alternatives": ["spokesperson", "representative"], "category": "job_title", "severity": "medium", "note": "Spokesperson is the standard gender-neutral term."},
    {"term": "craftsman", "alternatives": ["craftsperson", "artisan", "skilled worker"], "category": "job_title", "severity": "medium", "note": "Artisan or craftsperson is inclusive."},
    {"term": "foreman", "alternatives": ["supervisor", "foreperson", "team lead"], "category": "job_title", "severity": "medium", "note": "Supervisor or foreperson is standard in modern workplaces."},
    {"term": "workman", "alternatives": ["worker", "laborer", "tradesperson"], "category": "job_title", "severity": "medium", "note": "Worker is simple and inclusive."},
    {"term": "cameraman", "alternatives": ["camera operator", "cinematographer"], "category": "job_title", "severity": "medium", "note": "Camera operator is the professional term used in the industry."},
    {"term": "anchorman", "alternatives": ["anchor", "news anchor", "newscaster"], "category": "job_title", "severity": "medium", "note": "Anchor or news anchor is standard in broadcast journalism."},
    {"term": "anchorwoman", "alternatives": ["anchor", "news anchor", "newscaster"], "category": "job_title", "severity": "medium", "note": "Anchor or news anchor is standard in broadcast journalism."},
    {"term": "clergyman", "alternatives": ["clergy member", "cleric", "member of the clergy"], "category": "job_title", "severity": "medium", "note": "Clergy member is more inclusive of all gender identities."},
    {"term": "serviceman", "alternatives": ["service member", "military member"], "category": "job_title", "severity": "medium", "note": "Service member is the standard term used by military organizations."},
    {"term": "servicewoman", "alternatives": ["service member", "military member"], "category": "job_title", "severity": "medium", "note": "Service member is the standard term used by military organizations."},
    {"term": "airman", "alternatives": ["aviator", "air force member"], "category": "job_title", "severity": "medium", "note": "Aviator or pilot is gender-neutral."},
    {"term": "stewardess", "alternatives": ["flight attendant", "cabin crew member"], "category": "job_title", "severity": "medium", "note": "Flight attendant has been the industry standard since the 1970s."},
    {"term": "steward", "alternatives": ["flight attendant", "cabin crew member"], "category": "job_title", "severity": "low", "note": "Flight attendant is the preferred industry term."},
    {"term": "waitress", "alternatives": ["server", "wait staff"], "category": "job_title", "severity": "medium", "note": "Server is the inclusive standard in the hospitality industry."},
    {"term": "waiter", "alternatives": ["server", "wait staff"], "category": "job_title", "severity": "low", "note": "Server is the inclusive standard in the hospitality industry."},
    {"term": "actress", "alternatives": ["actor", "performer"], "category": "job_title", "severity": "low", "note": "Actor is increasingly used as a gender-neutral term in the industry."},
    {"term": "headmaster", "alternatives": ["head teacher", "principal", "head of school"], "category": "job_title", "severity": "medium", "note": "Principal or head of school is inclusive."},
    {"term": "headmistress", "alternatives": ["head teacher", "principal", "head of school"], "category": "job_title", "severity": "medium", "note": "Principal or head of school is inclusive."},
    {"term": "ombudsman", "alternatives": ["ombudsperson", "ombuds"], "category": "job_title", "severity": "medium", "note": "Ombudsperson or simply ombuds is increasingly standard."},
    {"term": "doorman", "alternatives": ["doorperson", "door attendant", "concierge"], "category": "job_title", "severity": "medium", "note": "Door attendant is the inclusive alternative."},
    {"term": "repairman", "alternatives": ["repair technician", "technician"], "category": "job_title", "severity": "medium", "note": "Technician is the professional, inclusive term."},
    {"term": "handyman", "alternatives": ["handyperson", "maintenance worker", "technician"], "category": "job_title", "severity": "medium", "note": "Maintenance worker or handyperson is inclusive."},
    {"term": "draftsman", "alternatives": ["drafter", "drafting technician"], "category": "job_title", "severity": "medium", "note": "Drafter is the current professional standard."},
    {"term": "fisherman", "alternatives": ["fisher", "angler"], "category": "job_title", "severity": "low", "note": "Fisher is the gender-neutral term used in environmental science."},
    {"term": "watchman", "alternatives": ["security guard", "watch person", "guard"], "category": "job_title", "severity": "medium", "note": "Security guard is the standard professional term."},
    {"term": "layman", "alternatives": ["layperson", "non-specialist", "non-expert"], "category": "job_title", "severity": "low", "note": "Layperson is the inclusive standard."},
    {"term": "middleman", "alternatives": ["intermediary", "go-between", "mediator"], "category": "job_title", "severity": "low", "note": "Intermediary is more precise and gender-neutral."},
    {"term": "barman", "alternatives": ["bartender", "barkeeper"], "category": "job_title", "severity": "low", "note": "Bartender is standard and gender-neutral."},
    {"term": "barmaid", "alternatives": ["bartender", "barkeeper"], "category": "job_title", "severity": "medium", "note": "Bartender is standard and gender-neutral."},
    {"term": "showman", "alternatives": ["showperson", "performer", "entertainer"], "category": "job_title", "severity": "low", "note": "Performer or entertainer is inclusive."},
    {"term": "nursemaid", "alternatives": ["caregiver", "childcare worker"], "category": "job_title", "severity": "medium", "note": "Caregiver is inclusive and professional."},
    {"term": "cleaning lady", "alternatives": ["cleaner", "housekeeper", "custodian"], "category": "job_title", "severity": "medium", "note": "Cleaner or custodian is professional and gender-neutral."},
    {"term": "cleaning woman", "alternatives": ["cleaner", "housekeeper", "custodian"], "category": "job_title", "severity": "medium", "note": "Cleaner or custodian is professional and gender-neutral."},

    # -----------------------------------------------------------------------
    # SALUTATIONS  (severity: medium)
    # -----------------------------------------------------------------------
    {"term": "dear sir", "alternatives": ["dear colleague", "dear team member", "to whom it may concern"], "category": "salutation", "severity": "medium", "note": "Unless you know the recipient uses 'sir', use a gender-neutral greeting."},
    {"term": "dear madam", "alternatives": ["dear colleague", "dear team member", "to whom it may concern"], "category": "salutation", "severity": "medium", "note": "Unless you know the recipient uses 'madam', use a gender-neutral greeting."},
    {"term": "dear sir or madam", "alternatives": ["dear colleague", "dear hiring manager", "to whom it may concern"], "category": "salutation", "severity": "medium", "note": "This assumes a gender binary. Use a role-based or neutral greeting instead."},
    {"term": "dear sirs", "alternatives": ["dear colleagues", "dear team", "dear all"], "category": "salutation", "severity": "medium", "note": "Addressing a group as 'sirs' assumes all members are men."},
    {"term": "gentlemen", "alternatives": ["everyone", "colleagues", "team", "all"], "category": "salutation", "severity": "medium", "note": "Use a gender-neutral group address."},
    {"term": "ladies and gentlemen", "alternatives": ["everyone", "distinguished guests", "colleagues", "friends"], "category": "salutation", "severity": "medium", "note": "This phrasing assumes a binary. 'Everyone' or 'distinguished guests' is inclusive."},
    {"term": "ladies", "alternatives": ["everyone", "team", "folks", "all"], "category": "salutation", "severity": "medium", "note": "Gendered group address; use 'everyone' or 'team' instead."},

    # -----------------------------------------------------------------------
    # COLLOQUIALISMS  (severity: low)
    # -----------------------------------------------------------------------
    {"term": "hey guys", "alternatives": ["hey everyone", "hey team", "hey folks", "hey all"], "category": "colloquialism", "severity": "low", "note": "While often used informally, 'guys' can feel exclusionary. 'Everyone' or 'folks' is more welcoming."},
    {"term": "you guys", "alternatives": ["you all", "y'all", "everyone", "folks"], "category": "colloquialism", "severity": "low", "note": "'You all' or 'folks' includes everyone without gendered assumptions."},
    {"term": "guys", "alternatives": ["everyone", "team", "folks", "people", "all"], "category": "colloquialism", "severity": "low", "note": "Consider a gender-neutral alternative for group address."},
    {"term": "man up", "alternatives": ["step up", "be brave", "show courage", "toughen up"], "category": "colloquialism", "severity": "medium", "note": "Equating courage with masculinity reinforces harmful stereotypes."},
    {"term": "grow a pair", "alternatives": ["show courage", "be brave", "stand firm"], "category": "colloquialism", "severity": "high", "note": "This phrase equates bravery with male anatomy and is exclusionary."},
    {"term": "man-made", "alternatives": ["machine-made", "synthetic", "artificial", "handmade", "manufactured"], "category": "colloquialism", "severity": "low", "note": "Synthetic or manufactured is more precise and inclusive."},
    {"term": "manmade", "alternatives": ["machine-made", "synthetic", "artificial", "manufactured"], "category": "colloquialism", "severity": "low", "note": "Synthetic or manufactured is more precise and inclusive."},
    {"term": "manpower", "alternatives": ["workforce", "staffing", "personnel", "labor", "human resources"], "category": "colloquialism", "severity": "low", "note": "Workforce or personnel is inclusive and professional."},
    {"term": "mankind", "alternatives": ["humankind", "humanity", "the human race", "people"], "category": "colloquialism", "severity": "low", "note": "Humankind and humanity are inclusive alternatives."},
    {"term": "man hours", "alternatives": ["person hours", "work hours", "labor hours", "staff hours"], "category": "colloquialism", "severity": "low", "note": "Person hours or work hours is more accurate and inclusive."},
    {"term": "man-hours", "alternatives": ["person-hours", "work-hours", "labor-hours"], "category": "colloquialism", "severity": "low", "note": "Person-hours or work-hours is more accurate and inclusive."},
    {"term": "the common man", "alternatives": ["the average person", "ordinary people", "everyday people"], "category": "colloquialism", "severity": "low", "note": "Average person or ordinary people is inclusive."},
    {"term": "no man's land", "alternatives": ["unclaimed territory", "neutral zone", "unoccupied area"], "category": "colloquialism", "severity": "low", "note": "Neutral zone is a clearer and inclusive alternative."},
    {"term": "right-hand man", "alternatives": ["right-hand person", "chief assistant", "top aide"], "category": "colloquialism", "severity": "low", "note": "Chief assistant or top aide is gender-neutral."},
    {"term": "best man for the job", "alternatives": ["best person for the job", "best candidate"], "category": "colloquialism", "severity": "medium", "note": "Best person or best candidate avoids gendered assumptions about competence."},
    {"term": "man the fort", "alternatives": ["hold the fort", "cover the office", "take charge"], "category": "colloquialism", "severity": "low", "note": "Hold the fort conveys the same meaning without gendered language."},
    {"term": "old wives' tale", "alternatives": ["superstition", "myth", "folk belief", "misconception"], "category": "colloquialism", "severity": "low", "note": "Myth or superstition is neutral and more precise."},
    {"term": "hysterical", "alternatives": ["hilarious", "very funny", "frantic", "overwhelmed"], "category": "colloquialism", "severity": "low", "note": "Historically used to dismiss women's emotions. Choose a more specific word."},
    {"term": "bossy", "alternatives": ["assertive", "decisive", "direct", "strong-willed"], "category": "colloquialism", "severity": "low", "note": "Disproportionately applied to women. Use specific, neutral descriptors."},
    {"term": "shrill", "alternatives": ["loud", "forceful", "passionate", "high-pitched"], "category": "colloquialism", "severity": "low", "note": "Often used to dismiss women's voices. Use neutral descriptors."},
    {"term": "emotional", "alternatives": ["passionate", "expressive", "invested", "responsive"], "category": "colloquialism", "severity": "low", "note": "In professional contexts, this is often applied pejoratively to women. Be specific."},
    {"term": "ball and chain", "alternatives": ["partner", "spouse", "significant other"], "category": "colloquialism", "severity": "medium", "note": "This is dismissive of spouses/partners and carries gendered connotations."},
    {"term": "master bedroom", "alternatives": ["primary bedroom", "main bedroom"], "category": "colloquialism", "severity": "low", "note": "Primary or main bedroom avoids problematic connotations."},
    {"term": "master/slave", "alternatives": ["primary/replica", "leader/follower", "parent/child", "controller/worker"], "category": "colloquialism", "severity": "medium", "note": "In technical contexts, primary/replica or leader/follower is preferred."},
    {"term": "master", "alternatives": ["primary", "main", "expert"], "category": "colloquialism", "severity": "low", "note": "Context-dependent. In technical contexts, 'primary' or 'main' is preferred."},
    {"term": "whitelist", "alternatives": ["allowlist", "permit list", "safe list"], "category": "colloquialism", "severity": "low", "note": "Allowlist is the inclusive standard in tech."},
    {"term": "blacklist", "alternatives": ["blocklist", "deny list", "exclusion list"], "category": "colloquialism", "severity": "low", "note": "Blocklist is the inclusive standard in tech."},

    # -----------------------------------------------------------------------
    # HONORIFICS  (severity: medium)
    # -----------------------------------------------------------------------
    {"term": "mr.", "alternatives": ["Mx."], "category": "honorific", "severity": "low", "note": "If you don't know someone's preferred title, Mx. is a gender-neutral option. Only flagged when the person's preference is unknown."},
    {"term": "mrs.", "alternatives": ["Mx.", "Ms."], "category": "honorific", "severity": "low", "note": "Mrs. reveals marital status. Ms. or Mx. are alternatives that don't."},
    {"term": "miss", "alternatives": ["Mx.", "Ms."], "category": "honorific", "severity": "low", "note": "Miss reveals marital status and age. Ms. or Mx. are neutral alternatives."},

    # -----------------------------------------------------------------------
    # FAMILIAL  (severity: low–medium)
    # -----------------------------------------------------------------------
    {"term": "mothering", "alternatives": ["parenting", "nurturing", "caregiving"], "category": "familial", "severity": "low", "note": "Parenting or nurturing is inclusive of all caregiver roles."},
    {"term": "fathering", "alternatives": ["parenting", "raising"], "category": "familial", "severity": "low", "note": "Parenting is inclusive of all caregiver roles."},
    {"term": "brotherhood", "alternatives": ["community", "solidarity", "fellowship", "kinship"], "category": "familial", "severity": "low", "note": "Community or solidarity is gender-neutral."},
    {"term": "sisterhood", "alternatives": ["community", "solidarity", "fellowship", "kinship"], "category": "familial", "severity": "low", "note": "Community or solidarity is gender-neutral."},
    {"term": "fraternal", "alternatives": ["sibling-like", "communal", "collegial"], "category": "familial", "severity": "low", "note": "Collegial or communal is inclusive."},
    {"term": "paternal", "alternatives": ["parental"], "category": "familial", "severity": "low", "note": "Parental is gender-neutral when describing leave or roles."},
    {"term": "maternal", "alternatives": ["parental"], "category": "familial", "severity": "low", "note": "Parental is gender-neutral when describing leave or roles."},
    {"term": "maternity leave", "alternatives": ["parental leave", "birthing parent leave"], "category": "familial", "severity": "low", "note": "Parental leave is inclusive of all parents regardless of gender."},
    {"term": "paternity leave", "alternatives": ["parental leave", "non-birthing parent leave"], "category": "familial", "severity": "low", "note": "Parental leave is inclusive of all parents regardless of gender."},

    # -----------------------------------------------------------------------
    # GENDERED DESCRIPTORS  (severity: low–medium)
    # -----------------------------------------------------------------------
    {"term": "mankind", "alternatives": ["humankind", "humanity", "people"], "category": "gendered_descriptor", "severity": "low", "note": "Humankind is the inclusive equivalent."},
    {"term": "freshman", "alternatives": ["first-year student", "first-year", "frosh"], "category": "gendered_descriptor", "severity": "low", "note": "First-year student is inclusive."},
    {"term": "manhole", "alternatives": ["utility hole", "maintenance hole", "access cover"], "category": "gendered_descriptor", "severity": "low", "note": "Several cities have adopted 'maintenance hole' officially."},
    {"term": "sportsmanship", "alternatives": ["fair play", "good conduct", "sporting behavior"], "category": "gendered_descriptor", "severity": "low", "note": "Fair play conveys the same meaning without gendered language."},
    {"term": "workmanship", "alternatives": ["craftsmanship", "quality of work", "skillfulness"], "category": "gendered_descriptor", "severity": "low", "note": "Quality of work is more specific and inclusive."},
    {"term": "penmanship", "alternatives": ["handwriting"], "category": "gendered_descriptor", "severity": "low", "note": "Handwriting is simpler and gender-neutral."},
    {"term": "sportsmanlike", "alternatives": ["sporting", "fair", "gracious"], "category": "gendered_descriptor", "severity": "low", "note": "Fair or gracious conveys the same meaning."},
    {"term": "grandfathered", "alternatives": ["legacy", "pre-existing", "exempt"], "category": "gendered_descriptor", "severity": "low", "note": "Legacy or pre-existing is more precise and avoids problematic origins."},
    {"term": "grandfather clause", "alternatives": ["legacy clause", "exemption clause"], "category": "gendered_descriptor", "severity": "low", "note": "Legacy clause avoids the term's discriminatory origins."},
    {"term": "manageress", "alternatives": ["manager"], "category": "gendered_descriptor", "severity": "medium", "note": "Manager is gender-neutral and professional."},
    {"term": "heroine", "alternatives": ["hero"], "category": "gendered_descriptor", "severity": "low", "note": "Hero is increasingly used as gender-neutral."},
    {"term": "male nurse", "alternatives": ["nurse"], "category": "gendered_descriptor", "severity": "medium", "note": "Adding 'male' implies nursing is inherently female. Just use 'nurse'."},
    {"term": "female doctor", "alternatives": ["doctor"], "category": "gendered_descriptor", "severity": "medium", "note": "Adding 'female' implies the profession is inherently male. Just use 'doctor'."},
    {"term": "female engineer", "alternatives": ["engineer"], "category": "gendered_descriptor", "severity": "medium", "note": "Adding 'female' implies the profession is inherently male. Just use 'engineer'."},
    {"term": "lady doctor", "alternatives": ["doctor"], "category": "gendered_descriptor", "severity": "medium", "note": "Gendering a profession implies it's unusual for that gender. Just use the title."},
    {"term": "woman doctor", "alternatives": ["doctor"], "category": "gendered_descriptor", "severity": "medium", "note": "Gendering a profession implies it's unusual for that gender. Just use the title."},
    {"term": "male secretary", "alternatives": ["secretary", "administrative assistant"], "category": "gendered_descriptor", "severity": "medium", "note": "Adding 'male' implies the role is inherently female. Just use the title."},

    # -----------------------------------------------------------------------
    # INSTITUTIONAL  (severity: medium)
    # -----------------------------------------------------------------------
    {"term": "manmade disaster", "alternatives": ["human-caused disaster", "anthropogenic disaster"], "category": "institutional", "severity": "low", "note": "Human-caused is accurate and gender-neutral."},
    {"term": "founding fathers", "alternatives": ["founders", "founding leaders"], "category": "institutional", "severity": "low", "note": "Founders is inclusive and still conveys the same meaning."},
    {"term": "forefathers", "alternatives": ["ancestors", "predecessors", "forebears"], "category": "institutional", "severity": "low", "note": "Ancestors or predecessors is gender-neutral."},
    {"term": "motherland", "alternatives": ["homeland", "home country", "native land"], "category": "institutional", "severity": "low", "note": "Homeland is gender-neutral."},
    {"term": "fatherland", "alternatives": ["homeland", "home country", "native land"], "category": "institutional", "severity": "low", "note": "Homeland is gender-neutral."},
    {"term": "mother tongue", "alternatives": ["native language", "first language", "home language"], "category": "institutional", "severity": "low", "note": "Native language or first language is gender-neutral."},

    # -----------------------------------------------------------------------
    # MARITIME & MILITARY  (severity: low)
    # -----------------------------------------------------------------------
    {"term": "seamanship", "alternatives": ["sailing skill", "navigation skill", "seafaring skill"], "category": "maritime_military", "severity": "low", "note": "Sailing skill is clear and inclusive."},
    {"term": "seaman", "alternatives": ["sailor", "mariner", "seafarer"], "category": "maritime_military", "severity": "medium", "note": "Sailor or mariner is gender-neutral."},

    # -----------------------------------------------------------------------
    # COMPOUND PHRASES  (severity: varies)
    # -----------------------------------------------------------------------
    {"term": "be a man about it", "alternatives": ["handle it maturely", "deal with it", "face it head-on"], "category": "compound", "severity": "medium", "note": "Equating maturity with masculinity reinforces stereotypes."},
    {"term": "throw like a girl", "alternatives": ["throw poorly", "throw weakly"], "category": "compound", "severity": "high", "note": "Using 'like a girl' as an insult is demeaning and sexist."},
    {"term": "run like a girl", "alternatives": ["run slowly"], "category": "compound", "severity": "high", "note": "Using 'like a girl' as an insult is demeaning and sexist."},
    {"term": "cry like a girl", "alternatives": ["cry", "be upset"], "category": "compound", "severity": "high", "note": "Using 'like a girl' as an insult is demeaning and sexist."},
    {"term": "boys will be boys", "alternatives": ["kids will be kids", "they're just playing"], "category": "compound", "severity": "high", "note": "This phrase excuses harmful behavior by attributing it to gender."},
    {"term": "boys' club", "alternatives": ["exclusive group", "inner circle", "closed network"], "category": "compound", "severity": "medium", "note": "Describes exclusionary culture; naming it helps address it."},
    {"term": "old boys' network", "alternatives": ["insider network", "exclusive network", "closed network"], "category": "compound", "severity": "medium", "note": "Describes exclusionary power structures."},
    {"term": "girl friday", "alternatives": ["assistant", "aide", "right-hand person"], "category": "compound", "severity": "medium", "note": "This term is diminutive. Use assistant or aide."},
    {"term": "acts like a man", "alternatives": ["acts assertively", "acts confidently"], "category": "compound", "severity": "medium", "note": "Assertiveness is not inherently masculine."},
    {"term": "acts like a woman", "alternatives": ["acts empathetically", "acts thoughtfully"], "category": "compound", "severity": "medium", "note": "Empathy is not inherently feminine."},
    {"term": "man's world", "alternatives": ["competitive world", "tough field"], "category": "compound", "severity": "medium", "note": "Reinforces the idea that certain spaces belong to men."},
    {"term": "career woman", "alternatives": ["professional", "career-driven person"], "category": "compound", "severity": "medium", "note": "We don't say 'career man'. Just say professional."},
    {"term": "working mother", "alternatives": ["working parent", "parent"], "category": "compound", "severity": "low", "note": "We rarely say 'working father'. Just say parent or professional."},
    {"term": "soccer mom", "alternatives": ["involved parent", "active parent"], "category": "compound", "severity": "low", "note": "Stereotypes parenting roles. Use involved parent."},
    {"term": "mama bear", "alternatives": ["protective parent", "fierce advocate"], "category": "compound", "severity": "low", "note": "Protective parent is gender-neutral."},
    {"term": "helicopter mom", "alternatives": ["overprotective parent", "hovering parent"], "category": "compound", "severity": "low", "note": "The gendered version targets mothers specifically."},
    {"term": "wine mom", "alternatives": ["stressed parent"], "category": "compound", "severity": "low", "note": "This stereotypes mothers' coping mechanisms."},
    {"term": "man cave", "alternatives": ["personal space", "retreat", "den"], "category": "compound", "severity": "low", "note": "Personal space or retreat is inclusive."},
    {"term": "arm candy", "alternatives": ["partner", "date", "companion"], "category": "compound", "severity": "medium", "note": "This objectifies a person. Use partner or companion."},
    {"term": "trophy wife", "alternatives": ["partner", "spouse"], "category": "compound", "severity": "high", "note": "This term objectifies women. Use partner or spouse."},

    # -----------------------------------------------------------------------
    # Additional inclusive tech/business terms
    # -----------------------------------------------------------------------
    {"term": "dummy value", "alternatives": ["placeholder value", "sample value", "test value"], "category": "colloquialism", "severity": "low", "note": "Placeholder or sample value is more professional."},
    {"term": "sanity check", "alternatives": ["soundness check", "confidence check", "coherence check", "quick check"], "category": "colloquialism", "severity": "low", "note": "Soundness check avoids ableist connotations."},
    {"term": "crazy", "alternatives": ["unexpected", "surprising", "wild", "intense"], "category": "colloquialism", "severity": "low", "note": "In professional contexts, more specific language is preferred."},
    {"term": "lame", "alternatives": ["unimpressive", "weak", "inadequate", "disappointing"], "category": "colloquialism", "severity": "low", "note": "Originally an ableist term. Use more specific descriptors."},
    {"term": "crippling", "alternatives": ["debilitating", "severely limiting", "devastating"], "category": "colloquialism", "severity": "low", "note": "Ableist language. Use debilitating or severely limiting."},
    {"term": "tone deaf", "alternatives": ["insensitive", "out of touch", "oblivious"], "category": "colloquialism", "severity": "low", "note": "Originally ableist. Use insensitive or out of touch."},
    {"term": "blind spot", "alternatives": ["gap", "oversight", "missed area", "weak point"], "category": "colloquialism", "severity": "low", "note": "Gap or oversight is more precise and avoids ableist language."},
    {"term": "turning a blind eye", "alternatives": ["ignoring", "overlooking", "disregarding"], "category": "colloquialism", "severity": "low", "note": "Ignoring or overlooking conveys the same meaning."},
]


def _build_lexicon() -> dict[str, LexiconEntry]:
    """Convert raw dicts into LexiconEntry objects keyed by lowercase term."""
    entries: dict[str, LexiconEntry] = {}
    for raw in _RAW_ENTRIES:
        entry = LexiconEntry(
            term=raw["term"].lower(),
            alternatives=raw["alternatives"],
            category=LexiconCategory(raw["category"]),
            severity=Severity(raw["severity"]),
            note=raw.get("note", ""),
        )
        entries[entry.term] = entry
    return entries


# Singleton lexicon – loaded once on import
LEXICON: dict[str, LexiconEntry] = _build_lexicon()


def get_all_entries() -> list[LexiconEntry]:
    """Return all lexicon entries."""
    return list(LEXICON.values())


def lookup(term: str) -> LexiconEntry | None:
    """Look up a term (case-insensitive)."""
    return LEXICON.get(term.lower())


def get_all_terms() -> list[str]:
    """Return all terms sorted by length (longest first for greedy matching)."""
    return sorted(LEXICON.keys(), key=len, reverse=True)
