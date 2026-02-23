#!/bin/bash
# Clear Next.js build cache
rm -rf /vercel/share/v0-project/.next
rm -rf /vercel/share/v0-project/node_modules/.cache
echo "Build cache cleared"
