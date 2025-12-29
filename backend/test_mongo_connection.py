import socket
import ssl
import certifi
import sys

def test_host(hostname, port, name, context_modifier=None):
    print(f"\n--- Testing {name} ({hostname}:{port}) ---")
    context = ssl.create_default_context(cafile=certifi.where())
    if context_modifier:
        context_modifier(context)
    
    try:
        sock = socket.create_connection((hostname, port), timeout=5)
        print("TCP Connected")
        with context.wrap_socket(sock, server_hostname=hostname) as ssock:
            print("SSL Handshake Succeeded")
            print(f"Cipher: {ssock.cipher()}")
            print(f"Version: {ssock.version()}")
    except Exception as e:
        print(f"SSL Handshake Failed: {e}")

def main():
    print(f"Python: {sys.version}")
    
    # 1. Sanity Check: Google
    test_host("google.com", 443, "Google (Sanity Check)")

    # 2. Atlas Default
    hostname = "ac-7oh8b67-shard-00-00.twyrrlf.mongodb.net"
    port = 27017
    test_host(hostname, port, "Atlas (Default)")

    # 3. Atlas Forced TLS 1.2
    def force_tls1_2(ctx):
        ctx.minimum_version = ssl.TLSVersion.TLSv1_2
        ctx.maximum_version = ssl.TLSVersion.TLSv1_2
        print("Forcing TLS 1.2")

    test_host(hostname, port, "Atlas (TLS 1.2)", force_tls1_2)

    # 4. Atlas Insecure
    def force_insecure(ctx):
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        print("Forcing Insecure (CERT_NONE)")

    test_host(hostname, port, "Atlas (Insecure)", force_insecure)

if __name__ == "__main__":
    main()
