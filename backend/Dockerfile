# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/farm2door-backend-*.jar app.jar
ENV PORT=8080
EXPOSE 8080 10000
ENTRYPOINT ["java", "-jar", "app.jar"]
