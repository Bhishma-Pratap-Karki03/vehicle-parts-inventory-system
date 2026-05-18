FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Coursework/Coursework.csproj", "Coursework/"]
COPY ["Coursework.Application/Coursework.Application.csproj", "Coursework.Application/"]
COPY ["Coursework.Domain/Coursework.Domain.csproj", "Coursework.Domain/"]
COPY ["Coursework.Infrastructure/Coursework.Infrastructure.csproj", "Coursework.Infrastructure/"]
RUN dotnet restore "Coursework/Coursework.csproj"
COPY . .
WORKDIR "/src/Coursework"
RUN dotnet build "./Coursework.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Coursework.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Coursework.dll"]
