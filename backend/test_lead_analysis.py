import asyncio

from services.lead_analysis_service import (
    analyze_lead
)

transcript = """
Hello, I would like to buy a 2BHK apartment in Hyderabad for 60 lakhs.
"""

result = asyncio.run(
    analyze_lead(transcript)
)

print(result)