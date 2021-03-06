# Deductions EHR Repository

A Proof of Concept implementation of how the Health Records of Patients that are not registered with a GP Practise could be stored digitally.

This is a component of the solution to validate that the GP2GP process can be used to preserve the Health Records of Patients that are deducted(no longer registered with a GP Practise). If successful this would allow their health record to be preserved in a digital format replacing the current practise of printing and storing the record.

## Prerequisites

- Node 12.x

## Set up

Run `npm install` to install all node dependencies.

Add a .env file in the project root directory with the following environment variables
(such as [.env.example](./.env.example)):

```
NODE_ENV=local
DATABASE_NAME=deductions_test
DATABASE_USER=deductions_user
DATABASE_PASSWORD=secret
DATABASE_HOST=127.0.0.1
S3_BUCKET_NAME=test-bucket
LOCALSTACK_URL=http://localhost:4572
```

## Running the tests

To run the tests locally, you can use the following.

```bash
# Brings up the local test environment
docker-compose up &

# Alternative with node-dojo (interactive)
# Requires changes to Environment Variables:
#   DATABASE_HOST=db
#   LOCALSTACK_URL=http://localstack:4572
dojo -c Dojofile-itest

npm run test-local

# This is equivilent of:
sequelize-cli db:migrate    # Runs the migration
sequelize-cli db:seed:all   # Seeds test data

npm test

sequelize-cli db:migrate:undo:all # Undoes the migration to leave clean env
```

To run them before commit in dojo.

```bash
./tasks test
```

## Start the app locally

Run a development server with `npm run start-local`.

## Start the app in production mode

```bash
# Dojo - same as what is run in pipeline

# Builds the docker container with the app in
./tasks build_docker_local

# Runs the tests against the app in the docker container
./tasks test_docker_local

# Runs the ehr with db and localstack locally in interactive mode
dojo -c Dojofile-dtest
```

# Docker

Docker image can be build locally with

```
./tasks build_docker_local
```

## Environment variables

Image is configurable by environment variables:

- `NHS_ENVIRONMENT` - should be set to current environment in which the container is deployed. The name must also exist in the `database.json` file.
- `S3_BUCKET_NAME` - the name of S3 bucket to store the EHR fragments in.
- `DATABASE_USER` - username for the database
- `DATABASE_PASSWORD` - password to the database
- `DATABASE_NAME` - name of the database on server.
- `DATABASE_HOST` - database server hostname to connect with.
- `LOCALSTACK_URL` - (Test) the location of localstack, only used for tests

## Creating the database locally

In order to see if the database has been seeded correctly, perform the following steps:

1. Run `docker-compose up`
2. Leaving that running in the terminal, and in another terminal run `npm run migrate`
3. Then run `npm run seed-test-data` to seed the database with the test data
4. Then run `run docker ps` and copy the id of the image ‘postgres’, then run `docker exec -it <id of process> psql -d deductions_test -U deductions_user`
   You can now query the database.

Alternatively you can either use a VSCode database plugin or IntelliJ database visualisation feature, with the following details:

```json
{
  "database": "deductions_test",
  "dialect": "PostgreSQL",
  "name": "EHR local",
  "port": 5432,
  "server": "localhost",
  "username": "deductions_user"
}
```

# Access to AWS

In order to get sufficient access to work with terraform or AWS CLI:

Export your AWS credentials in shell (if you have credentials in ~/.aws/credentials that will work too):

```
export AWS_ACCESS_KEY_ID=***********
export AWS_SECRET_ACCESS_KEY=**************************
unset AWS_SESSION_TOKEN
```

Enter docker container with terraform and AWS CLI by typing `dojo` at the root of the project.

Assume role with elevated permissions (role-arn needs to be the full ARN):

```
dojo -c Dojofile-infra "aws-cli-assumerole -rmfa <role-arn> <mfa-otp-code>"
```

Work with terraform as usual:

```
terraform init
terraform apply
```

If your session expires, exit the container to drop the temporary credentials and run dojo again.
