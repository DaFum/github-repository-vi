import os
import sys

def main():
    print("=" * 60)
    print("🚀 SYSTEM BOOTSTRAP: JULES IDENTITY LOADING...")
    print("=" * 60)
    print("")

    # 1. Read Protocol
    try:
        with open("docs/SKILL_PROTOCOL.md", "r") as f:
            print(f.read())
    except FileNotFoundError:
        print("ERROR: docs/SKILL_PROTOCOL.md not found!")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("📂 AVAILABLE SKILLS (skills/)")
    print("=" * 60)

    # 2. List Skills
    try:
        skills = sorted(os.listdir("skills"))
        for skill in skills:
            if os.path.isdir(os.path.join("skills", skill)):
                print(f"  - {skill}")
    except FileNotFoundError:
        print("ERROR: skills/ directory not found!")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("✅ BOOTSTRAP COMPLETE")
    print("👉 YOU ARE NOW UNLOCKED.")
    print("👉 PRIME DIRECTIVE: Use the skills listed above.")
    print("=" * 60)

if __name__ == "__main__":
    main()
