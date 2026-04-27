import serial.tools.list_ports

def list_ports():
    ports = serial.tools.list_ports.comports()
    if not ports:
        print("No ports found!")
    else:
        for p in ports:
            print(f"Found: {p.device} - {p.description}")

if __name__ == "__main__":
    list_ports()
