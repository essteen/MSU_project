FROM node:20 AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /workspace
COPY . .
COPY --from=frontend-build /workspace/frontend/dist /workspace/src/Homely.Api/wwwroot
RUN dotnet restore src/Homely.Api/Homely.Api.csproj
RUN dotnet publish src/Homely.Api/Homely.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "Homely.Api.dll"]