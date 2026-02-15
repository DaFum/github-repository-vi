import os
import re

def check_docstrings(directory):
    total_items = 0
    items_with_docstrings = 0
    missing_docstrings = []

    # Regex to find exported functions and classes
    # This is a basic regex and might not catch all edge cases (e.g., heavily nested structures, unique syntax)
    # It looks for `export function`, `export class`, `export const ... = (...) =>`, etc.
    export_pattern = re.compile(r'export\s+(?:async\s+)?(?:function|class|const|type|interface|enum)\s+([a-zA-Z0-9_]+)')

    # Regex to check for docstring (simple check for /** ... */ or /// ... before the definition)
    # We'll read the file line by line to handle context better

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.ts') or file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                lines = content.split('\n')
                for i, line in enumerate(lines):
                    match = export_pattern.search(line)
                    if match:
                        item_name = match.group(1)
                        # Check previous lines for docstring
                        has_docstring = False
                        # Look back a few lines (ignoring empty lines)
                        for j in range(i - 1, max(-1, i - 10), -1):
                            prev_line = lines[j].strip()
                            if not prev_line:
                                continue
                            if prev_line.endswith('*/') or prev_line.startswith('///'):
                                has_docstring = True
                                break
                            # If it's a decorator, continue searching above it.
                            if prev_line.startswith('@'):
                                continue
                            # Otherwise, it's some other code, so stop.
                            break

                        total_items += 1
                        if has_docstring:
                            items_with_docstrings += 1
                        else:
                            missing_docstrings.append(f"{filepath}:{i+1} - {item_name}")

    if total_items == 0:
        print("No exported items found.")
        return

    coverage = (items_with_docstrings / total_items) * 100
    print(f"Total exported items: {total_items}")
    print(f"Items with docstrings: {items_with_docstrings}")
    print(f"Docstring coverage: {coverage:.2f}%")

    if missing_docstrings:
        print("\nMissing docstrings:")
        for item in missing_docstrings:
            print(item)

if __name__ == "__main__":
    check_docstrings("src")
