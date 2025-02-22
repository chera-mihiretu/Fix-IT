# Build stage: Use Go 1.23.3 as the base image for building the Go application
FROM golang:1.23.3-alpine AS builder

# Set the working directory in the container
WORKDIR /app

# Copy Go module files and download dependencies
COPY go.mod go.sum ./
RUN go mod tidy

# Copy the source code into the container
COPY . .

# Build the Go application statically (disable CGO)
RUN CGO_ENABLED=0 go build -o main . 

# Final stage: Use a stable Alpine version as the base for the final container
FROM alpine:latest

# Install necessary libraries for your application (e.g., ca-certificates for SSL support)
RUN apk update && apk add --no-cache ca-certificates

# Set the working directory in the container
WORKDIR /root/

# Copy the statically built Go binary from the builder stage
COPY --from=builder /app/main .

COPY .env .

# Expose the necessary port (default for Go apps is 8080, change if needed)
EXPOSE 8080

# Command to run the Go application
CMD ["./main"]
