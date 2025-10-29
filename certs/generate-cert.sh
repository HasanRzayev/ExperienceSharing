#!/bin/bash

echo "Creating self-signed SSL certificate for development..."

# Create private key
openssl genrsa -out server.key 2048

# Create certificate signing request
openssl req -new -key server.key -out server.csr -subj "/C=TR/ST=Istanbul/L=Istanbul/O=Development/OU=IT Department/CN=localhost"

# Create self-signed certificate
openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Clean up CSR file
rm server.csr

echo "SSL certificate created successfully!"
echo "Files created:"
echo "- server.key (private key)"
echo "- server.crt (certificate)"
echo ""
echo "You can now run: npm run start:https:custom"
