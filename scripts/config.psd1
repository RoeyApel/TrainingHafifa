@{
    # ---------------------------------------------------------------------------
    # Shared settings for every setup script.
    #
    # infra/docker-compose.yml is the source of truth for container names, ports
    # and credentials. If you change something there, change it here too.
    # All paths are relative to the repository root.
    # ---------------------------------------------------------------------------

    ComposeFile = 'infra/docker-compose.yml'

    Containers  = @{
        PostGIS   = 'postgis'
        GeoServer = 'geoserver'
        PgAdmin   = 'pgadmin'
    }

    # Every geometry in the project must use this spatial reference.
    Srs         = 'EPSG:32636'

    Database    = @{
        Name     = 'imunim'
        User     = 'postgres'
        Password = 'Aa123456'
        # How GeoServer reaches the database: the compose service name, not localhost.
        Host     = 'postgis'
        Port     = 5432
        Schema   = 'public'
        Table      = 'force_deployment'
        SchemaFile = 'db/01_schema.sql'
        SeedFile   = 'db/02_seed.sql'
    }

    GeoServer   = @{
        Url          = 'http://localhost:8080/geoserver'
        User         = 'admin'
        Password     = 'geoserver'
        # Host folder mounted as /opt/geoserver_data inside the container.
        DataDir      = 'C:\ProgramData\GeoServer'
        Workspace    = 'imunim'
        NamespaceUri = 'http://imunim'
        # Hides soft-deleted features from every published layer.
        CqlFilter    = 'is_deleted = false'
    }

    GeoPackage  = @{
        Source       = 'geoserver/data/training_areas.gpkg'
        # Copied to <DataDir>\<TargetFolder>\, which GeoServer sees as file:<TargetFolder>/<file>.
        TargetFolder = 'gpkg'
    }

    DataStores  = @{
        PostGIS    = 'imunim_postgis'
        GeoPackage = 'training_areas_gpkg'
    }

    Layers      = @(
        @{
            Name      = 'force_deployment'
            DataStore = 'imunim_postgis'
            Style     = 'force_deployment_style'
            SldFile   = 'geoserver/styles/force_deployment_style.sld'
        }
        @{
            Name      = 'training_areas'
            DataStore = 'training_areas_gpkg'
            Style     = 'training_areas_style'
            SldFile   = 'geoserver/styles/training_areas_style.sld'
        }
    )
}
