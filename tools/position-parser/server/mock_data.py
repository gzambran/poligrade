"""Mock data for DEV_MODE testing without API calls."""

MOCK_RESPONSE = {
    "politician_name": "John Smith",
    "categories": [
        {
            "category": "Economic Policy",
            "positions": [
                {
                    "stance": "For increasing the federal minimum wage to $15 per hour by 2026",
                    "source_urls": ["https://example.com/issues"],
                    "note": None,
                },
                {
                    "stance": "Against extending the 2017 tax cuts for households earning over $400,000",
                    "source_urls": ["https://example.com/taxes"],
                    "note": None,
                },
            ],
        },
        {
            "category": "Business & Labor",
            "positions": [
                {
                    "stance": "For the PRO Act to strengthen union organizing rights",
                    "source_urls": ["https://example.com/labor"],
                    "note": None,
                },
            ],
        },
        {
            "category": "Health Care",
            "positions": [
                {
                    "stance": "For expanding Medicare to include dental, vision, and hearing coverage",
                    "source_urls": ["https://example.com/healthcare"],
                    "note": None,
                },
                {
                    "stance": "For allowing Medicare to negotiate prescription drug prices",
                    "source_urls": ["https://example.com/healthcare", "https://example.com/issues"],
                    "note": None,
                },
            ],
        },
        {
            "category": "Education",
            "positions": [
                {
                    "stance": "For universal pre-K for all 3 and 4 year olds",
                    "source_urls": ["https://example.com/education"],
                    "note": None,
                },
            ],
        },
        {
            "category": "Environment",
            "positions": [
                {
                    "stance": "For achieving net-zero carbon emissions by 2050",
                    "source_urls": ["https://example.com/climate"],
                    "note": None,
                },
                {
                    "stance": "Against new drilling permits on federal lands",
                    "source_urls": ["https://example.com/energy"],
                    "note": "Contradicts previous 2020 position supporting limited permits",
                },
            ],
        },
        {
            "category": "Civil Rights",
            "positions": [
                {
                    "stance": "For the Equality Act to ban discrimination based on sexual orientation and gender identity",
                    "source_urls": ["https://example.com/equality"],
                    "note": None,
                },
            ],
        },
        {
            "category": "Voting Rights",
            "positions": [
                {
                    "stance": "For automatic voter registration nationwide",
                    "source_urls": ["https://example.com/voting"],
                    "note": None,
                },
                {
                    "stance": "Against strict voter ID requirements",
                    "source_urls": ["https://example.com/voting"],
                    "note": None,
                },
            ],
        },
        {
            "category": "Immigration & Foreign Affairs",
            "positions": [
                {
                    "stance": "For a pathway to citizenship for DACA recipients",
                    "source_urls": ["https://example.com/immigration"],
                    "note": None,
                },
            ],
        },
        {
            "category": "Public Safety",
            "positions": [
                {
                    "stance": "For universal background checks on all gun sales",
                    "source_urls": ["https://example.com/guns"],
                    "note": None,
                },
                {
                    "stance": "Against defunding police departments",
                    "source_urls": ["https://example.com/safety"],
                    "note": None,
                },
            ],
        },
    ],
}
