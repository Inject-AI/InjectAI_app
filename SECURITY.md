# Security Policy

## Supported Versions

The following versions of Inject AI are currently supported with security updates:

| Version | Supported          |
|---------|------------------|
| 1.x     | ✅ Yes           |
| 0.x     | ❌ No (Outdated) |

## Reporting a Vulnerability

If you discover a security vulnerability in Inject AI, please follow these steps:

1. **Do not disclose it publicly.** Instead, report it privately to maintain security.
2. **Contact the security team via email**: security@injectai.com
3. Provide detailed information, including:
   - Steps to reproduce the issue.
   - Potential impact.
   - Any possible fixes or recommendations.

We aim to acknowledge reports within **48 hours** and provide a resolution within **7 days**, depending on severity.

## Security Best Practices

To keep your instance of Inject AI secure:

- Keep your dependencies updated using:
  ```bash
  npm update  # or yarn upgrade
  ```
- Use environment variables (`.env`) for sensitive credentials.
- Regularly audit dependencies with:
  ```bash
  npm audit  # or yarn audit
  ```
- Enable HTTPS for secure API communications.

## Responsible Disclosure

We appreciate ethical security researchers and request responsible disclosure. If you responsibly disclose a vulnerability, we will acknowledge your contribution.

Thank you for helping us keep Inject AI secure!
