import glob
import re
from groq import Groq

API_KEY = os.environ.get("GROQ_API_KEY")
client = Groq(api_key=API_KEY)
REPO_PATH = "node-easy-notes-app"


def explore_repo(repo_path):
    file_contents = {}
    for ext in [".js", ".ejs", ".html", ".css"]:
        for filepath in glob.glob(f"{repo_path}/**/*{ext}", recursive=True):
            if "node_modules" in filepath:
                continue
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    file_contents[filepath] = f.read()
            except Exception:
                pass
    return file_contents


def build_prompt(file_contents, user_request):
    files_section = ""
    for path, content in file_contents.items():
        files_section += f"\n--- FILE: {path} ---\n{content}\n"

    return f"""You are an AI coding agent. You are given a codebase and a user request.

USER REQUEST: {user_request}

Here is the current codebase:
{files_section}

Your task:
1. Write a brief execution plan (3-5 bullet points).
2. Decide which files need to change.
3. For EACH file you want to modify, output it in this EXACT format:

===FILE: <filepath>===
<full new content of the file>
===END FILE===

Only include files you are changing. Preserve existing functionality.
At the end, write a "SUMMARY:" section explaining what you changed and why.
"""


def get_agent_response(prompt):
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=8000,
    )
    return response.choices[0].message.content


def apply_changes(response_text):
    pattern = r"===FILE: (.*?)===\n(.*?)===END FILE==="
    matches = re.findall(pattern, response_text, re.DOTALL)
    changed_files = []
    for filepath, content in matches:
        filepath = filepath.strip()
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content.strip() + "\n")
        changed_files.append(filepath)
        print(f"Modified: {filepath}")
    return changed_files


def main():
    user_request = "Improve the application so users can better organise and search their notes."

    file_contents = explore_repo(REPO_PATH)
    print(f"Found {len(file_contents)} files to analyze.")

    prompt = build_prompt(file_contents, user_request)
    response_text = get_agent_response(prompt)

    print(response_text)

    changed = apply_changes(response_text)
    print(f"Done. {len(changed)} file(s) modified: {changed}")

    with open("agent_log.txt", "w", encoding="utf-8") as f:
        f.write(response_text)


if __name__ == "__main__":
    main()