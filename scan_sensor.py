import minimalmodbus
import serial
import time

# --- CONFIGURATION ---
PORT_NAME = 'COM7'  # Your correct port

# Search parameters
BAUD_RATES = [9600, 4800, 19200]
SLAVE_IDS = [1, 2, 3]

print(f"Scanning for Sensor on {PORT_NAME}...")
print("Please ensure the sensor is powered (12V recommended).")

found = False

for baud in BAUD_RATES:
    for slave_id in SLAVE_IDS:
        print(f"   Testing: Baud={baud}, ID={slave_id}...", end="")
        
        try:
            instrument = minimalmodbus.Instrument(PORT_NAME, slave_id)
            instrument.serial.baudrate = baud
            instrument.serial.timeout = 0.5
            instrument.close_port_after_each_call = True
            
            # Try to read just 1 register (Temperature)
            # Register 0 or 1 is usually safe to read
            val = instrument.read_register(0, 1) 
            
            print(f" SUCCESS! Response: {val}")
            print("\n" + "="*40)
            print(f" FOUND IT! Update your settings:")
            print(f"   BAUDRATE = {baud}")
            print(f"   SLAVE_ADDRESS = {slave_id}")
            print("="*40 + "\n")
            found = True
            break
            
        except Exception:
            print(" No reply")
            
    if found:
        break

if not found:
    print("\n SENSOR NOT FOUND.")
    print("Troubleshooting:")
    print("1. Swap Yellow/Blue wires.")
    print("2. Check 12V Power Supply.")
    print("3. Check Ground connection (Black wire).")
