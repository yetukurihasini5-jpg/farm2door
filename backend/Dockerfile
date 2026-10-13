# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN mkdir -p uploads
COPY --from=build /app/target/farm2door-backend-*.jar app.jar
ENV PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0"
EXPOSE 8080 10000
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
