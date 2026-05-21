# Jenkins CI/CD Pipeline Setup Guide

## Overview

This document describes the complete Jenkins CI/CD pipeline for the Orgatick project. The pipeline automates testing, linting, building, and deployment processes.

## Pipeline Stages

### 1. **Checkout Code**

- Clones the repository from the configured source control
- Displays the current branch being built

### 2. **Install Dependencies**

- Installs pnpm if not already available
- Installs all project dependencies using `pnpm install --frozen-lockfile`

### 3. **Linting** ⭐ NEW

- Runs ESLint to check code quality
- Fails the build if linting errors are found (`--max-warnings=0`)
- Records linting issues in Jenkins reports
- Command: `pnpm run lint`

### 4. **Type Check** ⭐ NEW

- Validates TypeScript types
- Ensures no TypeScript compilation errors
- Command: `pnpm run build:ts`

### 5. **Unit Tests** ⭐ NEW

- Executes all unit tests using Vitest
- Generates code coverage reports
- Publishes coverage metrics (Cobertura format)
- Publishes test results (JUnit format)
- Command: `pnpm run test:coverage`

### 6. **Build**

- Compiles TypeScript to JavaScript
- Generates assets
- Creates production-ready code in `dist/` directory
- Command: `pnpm run build`

### 7. **SonarQube Analysis** ⭐ NEW

- Only runs on `main` branch
- Analyzes code quality and security
- Publishes coverage to SonarQube server
- Requires SONAR_HOST_URL and SONAR_TOKEN credentials

### 8. **Build Docker Image**

- Builds Docker image with tag `${BUILD_NUMBER}`
- Creates `latest` tag for latest build

### 9. **Docker Security Scan**

- Only runs on `main` branch
- Scans Docker image for vulnerabilities using Trivy
- Identifies HIGH and CRITICAL severity issues

### 10. **Login to Docker Hub**

- Only runs on `main` branch
- Authenticates with Docker Hub registry

### 11. **Push Docker Image**

- Only runs on `main` branch
- Pushes built image to Docker Hub registry
- Tags with both `latest` and build number

### 12. **Artifact Archive**

- Compresses `dist/` directory
- Archives build artifacts for later retrieval

## Jenkins Configuration Required

### 1. **Credentials Setup**

Add these credentials in Jenkins (Manage Jenkins → Manage Credentials):

#### Docker Hub Credentials

- **Credential ID**: `orgatick`
- **Type**: Username with Password
- **Username**: Your Docker Hub username
- **Password**: Your Docker Hub password or token

#### SonarQube Credentials

- **Credential ID**: `sonar-host-url`
- **Type**: Secret Text
- **Secret**: Your SonarQube server URL (e.g., `https://sonarqube.example.com`)

- **Credential ID**: `sonar-token`
- **Type**: Secret Text
- **Secret**: Your SonarQube authentication token

### 2. **Email Configuration**

Configure email notifications in Jenkins (Manage Jenkins → Configure System):

- Set SMTP server
- Configure default recipients
- Enable extended email notifications plugin

### 3. **Required Jenkins Plugins**

Install these plugins via Manage Jenkins → Manage Plugins:

```
- Pipeline
- Pipeline: Stage View
- Email Extension Plugin
- JUnit Plugin
- Cobertura Plugin
- HTML Publisher Plugin
- Docker Pipeline
- Credentials Binding Plugin
- ESLint Plugin (optional, for better linting reports)
```

### 4. **Node.js Configuration**

Ensure Node.js and npm/pnpm are installed on Jenkins agent:

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm globally
npm install -g pnpm
```

### 5. **Docker Configuration**

Ensure Docker is installed and Jenkins user has permissions:

```bash
# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins
```

## Pipeline Behavior

### On `main` Branch

- Runs all stages including Docker push and SonarQube analysis
- Full quality gates applied
- Production deployment

### On Feature/Dev Branches

- Skips Docker push and SonarQube analysis
- Still runs tests, linting, and build
- Quick feedback loop

## Build Artifacts

### Test Reports

- **Location**: `coverage/` directory
- **Coverage Report**: `coverage/index.html`
- **LCOV Format**: `coverage/lcov.info`
- **Cobertura Format**: `coverage/cobertura-coverage.xml`

### Build Artifacts

- **Compressed Archive**: `dist-${BUILD_NUMBER}.tar.gz`
- **Location**: Jenkins artifact storage

## Notifications

### Success Notifications

- Email sent with build details
- Includes build URL and artifacts location
- Triggered on successful build completion

### Failure Notifications

- Email sent with failure details
- Includes build logs attachment
- Links to console output for debugging

## Performance Optimization

1. **Frozen Lockfile**: Prevents unexpected dependency updates
2. **Cache**: Jenkins automatically caches Docker layers
3. **Build Timeout**: 1 hour maximum to prevent hung builds
4. **Log Retention**: Keeps last 10 builds for history

## Troubleshooting

### Issue: Linting Fails with "max-warnings exceeded"

- Fix ESLint warnings/errors in source code
- Run `pnpm run lint` locally to identify issues
- Update ESLint rules in `eslint.config.ts` if needed

### Issue: Docker Push Fails

- Verify Docker Hub credentials in Jenkins
- Check Docker Hub connectivity
- Ensure Jenkins user has Docker permissions

### Issue: Tests Timeout

- Increase timeout in Jenkinsfile (currently 1 hour)
- Check for infinite loops or long-running tests
- Review test logs for details

### Issue: SonarQube Connection Error

- Verify SONAR_HOST_URL is accessible
- Check SONAR_TOKEN validity
- Ensure SonarQube project exists

## Next Steps

1. Create Jenkins job from this Jenkinsfile
2. Configure all required credentials
3. Set up webhooks from Git for automatic builds
4. Monitor first few builds
5. Adjust thresholds and rules as needed

## Related Files

- `vitest.config.ts` - Test configuration
- `.eslintrc.ts` / `eslint.config.ts` - Linting configuration
- `package.json` - Scripts and dependencies
- `Dockerfile` - Docker image definition
- `sonar-project.properties` - SonarQube configuration

## References

- [Jenkins Pipeline Documentation](https://www.jenkins.io/doc/book/pipeline/)
- [Vitest Documentation](https://vitest.dev/)
- [ESLint Documentation](https://eslint.org/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
