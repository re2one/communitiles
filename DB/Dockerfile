FROM mariadb:10.3.11

# Setting environment variables
ENV MYSQL_ROOT_PASSWORD 1337

# Adding init scripts
COPY ["Scripts/", "/docker-entrypoint-initdb.d"]