# Network Access Instructions

## Accessing the Backend from Other Devices

The backend server is now configured to accept connections from other devices on the same network.

### Starting the Server

```bash
npm run dev
```

### Finding Your Network IP Address

To find the IP address of your machine on the local network:

```bash
npm run network
```

This will display all available IP addresses where the backend can be accessed.

### Accessing from Other Devices

1. Make sure both devices are on the same network (Wi-Fi or LAN)
2. Find your machine's IP address using the `npm run network` command
3. On the other device, access the backend using: `http://YOUR_IP_ADDRESS:3000`
   - Example: `http://192.168.1.100:3000`

### Configuring Frontend for Network Access

To configure the frontend to connect to the backend using the network IP:

1. Create a `.env.local` file in the frontend directory
2. Add the following line:
   ```
   VITE_API_URL=http://YOUR_IP_ADDRESS:3000
   ```
   Replace `YOUR_IP_ADDRESS` with your actual IP address
3. Restart the frontend development server

### Troubleshooting

If you can't access the backend from other devices:

1. Check your firewall settings - make sure port 3000 is allowed
2. Verify both devices are on the same network
3. Confirm the backend is running and shows the network IP addresses
4. Try accessing `http://localhost:3000` from the same machine to verify the backend is working