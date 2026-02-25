import asyncio
from services.quiz_ai import generate_quiz
from services.assignment_ai import generate_assignment
from dotenv import load_dotenv
import traceback

load_dotenv()

async def main():
    with open("ai_debug.log", "w", encoding="utf-8") as f:
        f.write("Testing generate_quiz...\n")
        try:
            quiz = await generate_quiz("React hooks", "Basic", "Frontend Developer")
            f.write("Quiz Success!\n")
            f.write(str(quiz) + "\n")
        except Exception as e:
            f.write("Quiz Failed: " + str(e) + "\n")
            f.write(traceback.format_exc() + "\n")

        f.write("\nTesting generate_assignment...\n")
        try:
            assignment = await generate_assignment("React hooks", "Basic", "Frontend Developer")
            f.write("Assignment Success!\n")
            f.write(str(assignment) + "\n")
        except Exception as e:
            f.write("Assignment Failed: " + str(e) + "\n")
            f.write(traceback.format_exc() + "\n")

if __name__ == "__main__":
    asyncio.run(main())
