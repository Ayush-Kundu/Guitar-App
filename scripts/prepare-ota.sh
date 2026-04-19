#!/bin/bash
# Prepare an OTA update bundle for Strummy.
#
# Usage:
#   npm run build
#   npm run ota:prepare
#
# This creates:
#   ota/manifest.json     — version manifest (upload to strummy.studio/ota/)
#   ota/strummy-X.Y.Z.zip — zipped build assets (upload alongside manifest)
#
# Then in Supabase/hosting, upload both files so they're accessible at:
#   https://strummy.studio/ota/manifest.json
#   https://strummy.studio/ota/strummy-X.Y.Z.zip

set -euo pipefail

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")
OTA_DIR="ota"
ZIP_NAME="strummy-${VERSION}.zip"
BASE_URL="${OTA_BASE_URL:-https://strummy.studio/ota}"

echo "Preparing OTA bundle v${VERSION}..."

# Ensure build exists
if [ ! -d "build" ]; then
  echo "Error: build/ directory not found. Run 'npm run build' first."
  exit 1
fi

# Create ota directory
mkdir -p "$OTA_DIR"

# Zip the build directory contents (not the directory itself)
cd build
zip -r "../${OTA_DIR}/${ZIP_NAME}" . -x "*.DS_Store"
cd ..

# Generate manifest
cat > "${OTA_DIR}/manifest.json" <<EOF
{
  "version": "${VERSION}",
  "url": "${BASE_URL}/${ZIP_NAME}"
}
EOF

echo ""
echo "OTA bundle ready:"
echo "  ${OTA_DIR}/manifest.json"
echo "  ${OTA_DIR}/${ZIP_NAME}"
echo ""
echo "Upload both files to ${BASE_URL}/"
echo "Then bump the version in package.json for the next release."
