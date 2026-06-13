import subprocess
import time
import os
import re
import shutil

def update_env(public_url):
    env_path = os.path.join("backend", ".env")
    if not os.path.exists(env_path):
        print(f"Error: backend/.env not found at {env_path}")
        return False

    try:
        with open(env_path, "r") as f:
            lines = f.readlines()

        updated = False
        for idx, line in enumerate(lines):
            if line.strip().startswith("NGROK_URL="):
                lines[idx] = f"NGROK_URL={public_url}\n"
                updated = True
                break

        if not updated:
            lines.append(f"\nNGROK_URL={public_url}\n")

        with open(env_path, "w") as f:
            f.writelines(lines)
        print(f"[Tunnel Manager] backend/.env updated with NGROK_URL={public_url}")
        return True
    except Exception as e:
        print(f"[Tunnel Manager] Error updating .env: {e}")
        return False

def get_ngrok_domain():
    env_path = os.path.join("backend", ".env")
    if not os.path.exists(env_path):
        return None
    try:
        with open(env_path, "r") as f:
            for line in f:
                if line.strip().startswith("NGROK_DOMAIN="):
                    val = line.strip().split("=", 1)[1].strip()
                    if val:
                        return val
    except Exception:
        pass
    return None

def get_ngrok_executable():
    # Check if ngrok.exe exists in the current directory
    if os.path.exists("ngrok.exe"):
        return os.path.abspath("ngrok.exe")
    # Check if ngrok is on system path
    path_executable = shutil.which("ngrok")
    if path_executable:
        return path_executable
    return None

def run_tunnel():
    print("=========================================================")
    print("      Aura Apartment Assistant - Tunnel Manager          ")
    print("=========================================================")
    
    ngrok_domain = get_ngrok_domain()
    ngrok_exe = get_ngrok_executable() if ngrok_domain else None

    if ngrok_domain and ngrok_exe:
        print(f"[Tunnel Manager] Static Ngrok mode selected.")
        print(f"[Tunnel Manager] Domain: {ngrok_domain}")
        print(f"[Tunnel Manager] Executable path: {ngrok_exe}")
        
        public_url = f"https://{ngrok_domain}"
        update_env(public_url)
        
        ngrok_cmd = [ngrok_exe, "http", "8000", "--domain", ngrok_domain]
        
        while True:
            print(f"\n[Tunnel Manager] Starting Ngrok in new console window...")
            try:
                process = subprocess.Popen(
                    ngrok_cmd,
                    creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == "nt" else 0
                )
                
                # Check periodically if process died
                while True:
                    if process.poll() is not None:
                        break
                    time.sleep(2)
            except Exception as e:
                print(f"[Tunnel Manager] Error starting ngrok process: {e}")
                time.sleep(5)
                continue
                
            return_code = process.poll()
            print(f"[Tunnel Manager] Ngrok process exited with code {return_code}")
            print("[Tunnel Manager] Reconnecting in 5 seconds...")
            time.sleep(5)
            
    else:
        if ngrok_domain and not ngrok_exe:
            print("[Tunnel Manager] WARNING: NGROK_DOMAIN is defined in .env, but ngrok executable was not found.")
            print("[Tunnel Manager] Please place ngrok.exe in the project root folder or add it to system PATH.")
            print("[Tunnel Manager] Falling back to localhost.run SSH tunnel...\n")

        ssh_cmd = [
            "ssh",
            "-o", "StrictHostKeyChecking=no",
            "-o", "ServerAliveInterval=15",
            "-o", "ServerAliveCountMax=3",
            "-R", "80:127.0.0.1:8000",
            "nokey@localhost.run"
        ]
        log_path = "tunnel.log"
        url_pattern = re.compile(r"https://[a-zA-Z0-9-.]+\.lhr\.life")

        while True:
            # Clean up old log file if it exists
            if os.path.exists(log_path):
                try:
                    os.remove(log_path)
                except Exception:
                    pass

            print(f"\n[Tunnel Manager] Starting SSH tunnel in new console window...")
            
            try:
                # Open log file to write ssh output
                log_file = open(log_path, "w")
                
                # Start process in a new console window to make sure ssh works natively
                process = subprocess.Popen(
                    ssh_cmd,
                    stdout=log_file,
                    stderr=log_file,
                    creationflags=subprocess.CREATE_NEW_CONSOLE if os.name == "nt" else 0
                )
            except Exception as e:
                print(f"[Tunnel Manager] Error starting ssh command: {e}")
                print("[Tunnel Manager] Retrying in 5 seconds...")
                time.sleep(5)
                continue

            # Wait a moment for log file to be created
            time.sleep(1)
            
            # Read the log file line by line as it is written
            try:
                with open(log_path, "r") as f:
                    while True:
                        line = f.readline()
                        if not line:
                            # No new line, check if process died
                            if process.poll() is not None:
                                break
                            time.sleep(0.5)
                            continue
                        
                        cleaned_line = line.strip()
                        if cleaned_line:
                            print(f"[Tunnel Output] {cleaned_line}")
                        
                        match = url_pattern.search(cleaned_line)
                        if match:
                            url = match.group(0)
                            print(f"[Tunnel Manager] Found secure tunnel URL: {url}")
                            update_env(url)
            except Exception as e:
                print(f"[Tunnel Manager] Error reading tunnel log: {e}")
            finally:
                log_file.close()

            # Process exited
            return_code = process.poll()
            print(f"[Tunnel Manager] SSH tunnel process exited with code {return_code}")
            print("[Tunnel Manager] Reconnecting in 5 seconds...")
            time.sleep(5)

if __name__ == "__main__":
    run_tunnel()

