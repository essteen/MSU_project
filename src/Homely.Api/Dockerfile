FROM node:20 AS frontend-build
WORKDIR /src/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
COPY --from=frontend-build /src/frontend/dist /src/Homely.Api/wwwroot
RUN dotnet restore Homely.Api/Homely.Api.csproj
RUN dotnet publish Homely.Api/Homely.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Homely.Api.dll"]