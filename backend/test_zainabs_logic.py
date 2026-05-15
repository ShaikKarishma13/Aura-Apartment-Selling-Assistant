import asyncio
from models.pydantic_schemas import ChatMessage
from services.llm_service import generate_sales_response
from services.lead_scoring import classify_lead

async def run_mock_conversation():
    print("--- STARTING ZAINAB'S AI LOGIC TEST ---\n")
    
    history = []
    
    # Turn 1
    user_input_1 = "Hi, I'm looking for a luxury apartment."
    print(f"User: {user_input_1}")
    
    resp_1 = await generate_sales_response(user_input_1, history)
    print(f"AI Agent: {resp_1}\n")
    
    history.append(ChatMessage(role="user", content=user_input_1))
    history.append(ChatMessage(role="assistant", content=resp_1))
    
    # Turn 2: Pushing back on price (Testing the objection handling)
    user_input_2 = "Actually, I heard your prices are way too high for me right now."
    print(f"User: {user_input_2}")
    
    resp_2 = await generate_sales_response(user_input_2, history)
    print(f"AI Agent: {resp_2}\n")
    
    history.append(ChatMessage(role="user", content=user_input_2))
    history.append(ChatMessage(role="assistant", content=resp_2))
    
    # Lead Classification Test
    print("--- RUNNING ZAINAB'S LEAD CLASSIFICATION ENGINE ---")
    analysis = await classify_lead(history)
    print(f"Lead Score Result: {analysis}")

if __name__ == "__main__":
    asyncio.run(run_mock_conversation())
