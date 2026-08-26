# --- build stage ---------------------------------------------------------
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY BookQuoteApi.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app --no-restore

# --- runtime stage ---------------------------------------------------------
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .

ENV ASPNETCORE_ENVIRONMENT=Production
# SQLite file lives here; Render's free web services have an EPHEMERAL filesystem,
# so this resets on every deploy/restart/spin-down — see deploy notes.
ENV ConnectionStrings__Default="Data Source=/app/data/app.db"

# Render injects $PORT at runtime and expects the app to listen on it.
CMD ["sh", "-c", "mkdir -p /app/data && ASPNETCORE_URLS=http://+:$PORT dotnet BookQuoteApi.dll"]
