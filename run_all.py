import subprocess
import time
import os
import sys

def main():
    print("=========================================================")
    print("Aura Apartment Selling Assistant - Automated Start Script")
    print("=========================================================")

    # 1. Clear NGROK_URL in backend/.env to wait for a fresh one
    env_path = os.path.join("backend", ".env")
    if os.path.exists(env_path):
        try:
            with open(env_path, "r") as f:
                lines = f.readlines()
            for idx, line in enumerate(lines):
                if line.strip().startswith("NGROK_URL="):
                    lines[idx] = "NGROK_URL=\n"
            with open(env_path, "w") as f:
                f.writelines(lines)
        except Exception as e:
            print(f"Warning: could not clear NGROK_URL in .env: {e}")

    # 2. Start the tunnel manager script in a new command prompt window
    print("\n[1/3] Starting secure HTTPS tunnel manager...")
    try:
        tunnel_cmd = 'cmd.exe /c start cmd.exe /k "backend\\venv\\Scripts\\activate && python manage_tunnel.py"'
        subprocess.Popen(tunnel_cmd, shell=True)
    except Exception as e:
        print(f"Error starting tunnel manager: {e}")
        sys.exit(1)

    # 3. Wait for NGROK_URL to be set in backend/.env
    print("Waiting for tunnel URL to generate and update in backend/.env...")
    public_url = None
    for _ in range(30):
        time.sleep(1)
        if os.path.exists(env_path):
            try:
                with open(env_path, "r") as f:
                    for line in f:
                        if line.strip().startswith("NGROK_URL=") and len(line.strip().split("=", 1)[1].strip()) > 10:
                            public_url = line.strip().split("=", 1)[1].strip()
                            break
            except Exception:
                pass
            if public_url:
                print(f"-> Secure public URL generated: {public_url}")
                break

    if not public_url:
        print("Could not retrieve tunnel URL from backend/.env. Check the opened tunnel console window.")
        sys.exit(1)

    # 4. Start the backend in a new command prompt window
    print("\n[3/3] Launching Backend & Frontend servers...")
    print("-> Starting Backend on http://localhost:8000...")
    backend_cmd = "cmd.exe /c start cmd.exe /k \"cd backend && venv\\Scripts\\activate && python -m uvicorn main:app --reload\""
    subprocess.Popen(backend_cmd, shell=True)

    # 5. Start the frontend in a new command prompt window
    print("-> Starting Frontend on http://localhost:3000...")
    frontend_cmd = "cmd.exe /c start cmd.exe /k \"cd frontend && npm start\""
    subprocess.Popen(frontend_cmd, shell=True)

    print("\n=========================================================")
    print("All systems initiated successfully!")
    print(f"Public Webhook URL: {public_url}")
    print("You can close this window now. Backend & Frontend are running in separate consoles.")
    print("=========================================================")

if __name__ == "__main__":
    main()
