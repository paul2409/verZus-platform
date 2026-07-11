const [major = "0", minor = "0"] = process.versions.node.split(".");
const majorNumber = Number(major);
const minorNumber = Number(minor);

const supported = (majorNumber === 22 && minorNumber >= 12) || majorNumber === 24;

if (!supported) {
  console.error(
    [
      `Unsupported Node.js version: ${process.versions.node}`,
      "VERZUS requires Node.js 22.12 or newer, up to Node.js 24.",
      "Node.js 24 LTS is the repository default. Run: nvm use",
    ].join("\n"),
  );
  process.exit(1);
}
