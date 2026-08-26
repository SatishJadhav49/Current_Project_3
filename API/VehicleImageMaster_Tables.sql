/**********************************************************************************************
    Vehicle Image Master  -  table creation script
    Database        : 1D_Module
    Developer       : Satish Jadhav ( 50005817 )

    Tables created  : 1) MM_Vehicle_Image_Master     - the vehicle image uploaded against a model
                      2) MM_Vehicle_Image_Mapping    - locations mapped on that image

    Note : X_Coordinate / Y_Coordinate are stored in PERCENTAGE of the image ( 0 to 100 ),
           not in pixels. Because of that the marker always points to the same spot of the
           vehicle on any screen size and on any image resolution.
**********************************************************************************************/

USE [1D_Module]
GO

SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

/*-------------------------------------------------------------------------------------------
    1) MM_Vehicle_Image_Master
-------------------------------------------------------------------------------------------*/
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MM_Vehicle_Image_Master]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[MM_Vehicle_Image_Master](
        [Vehicle_Image_ID]  [numeric](18, 0) IDENTITY(1,1) NOT NULL,
        [Image_Name]        [varchar](100)   NOT NULL,
        [FileContent]       [varbinary](max) NULL,
        [FileName]          [varchar](100)   NULL,
        [FileType]          [varchar](50)    NULL,
        [ContentType]       [varchar](50)    NULL,
        [Shop_ID]           [numeric](18, 0) NOT NULL,
        [Model_ID]          [numeric](18, 0) NOT NULL,
        [Plant_ID]          [numeric](18, 0) NOT NULL,
        [Audit_Type_Id]     [numeric](18, 0) NULL,
        [Is_Active]         [bit]            NULL,
        [Is_Transferred]    [bit]            NULL,
        [Is_Purgeable]      [bit]            NULL,
        [Is_Edited]         [bit]            NULL,
        [Is_Deleted]        [bit]            NULL,
        [Inserted_Host]     [nvarchar](100)  NULL,
        [Inserted_User_ID]  [numeric](18, 0) NULL,
        [Inserted_Date]     [datetime]       NULL,
        [Updated_Host]      [nvarchar](100)  NULL,
        [Updated_User_ID]   [numeric](18, 0) NULL,
        [Updated_Date]      [datetime]       NULL,
     CONSTRAINT [PK_MM_Vehicle_Image_Master] PRIMARY KEY CLUSTERED
    (
        [Vehicle_Image_ID] ASC
    ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]

    PRINT 'Table MM_Vehicle_Image_Master created.'
END
ELSE
    PRINT 'Table MM_Vehicle_Image_Master already exists , skipped.'
GO

/*-------------------------------------------------------------------------------------------
    2) MM_Vehicle_Image_Mapping
-------------------------------------------------------------------------------------------*/
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[MM_Vehicle_Image_Mapping]') AND type = N'U')
BEGIN
    CREATE TABLE [dbo].[MM_Vehicle_Image_Mapping](
        [Mapping_ID]        [numeric](18, 0) IDENTITY(1,1) NOT NULL,
        [Vehicle_Image_ID]  [numeric](18, 0) NOT NULL,
        [Shop_ID]           [numeric](18, 0) NOT NULL,
        [Model_ID]          [numeric](18, 0) NOT NULL,
        [Area_ID]           [numeric](18, 0) NOT NULL,
        [Part_ID]           [numeric](18, 0) NOT NULL,
        [Checkpoint_ID]     [numeric](18, 0) NOT NULL,
        [Location_ID]       [numeric](18, 0) NOT NULL,
        [X_Coordinate]      [decimal](5, 2)  NOT NULL,
        [Y_Coordinate]      [decimal](5, 2)  NOT NULL,
        [Plant_ID]          [numeric](18, 0) NULL,
        [Audit_Type_Id]     [numeric](18, 0) NULL,
        [Is_Active]         [bit]            NULL,
        [Is_Purgeable]      [bit]            NULL,
        [Is_Edited]         [bit]            NULL,
        [Is_Deleted]        [bit]            NULL,
        [Inserted_Host]     [nvarchar](100)  NULL,
        [Inserted_User_ID]  [numeric](18, 0) NULL,
        [Inserted_Date]     [datetime]       NULL,
        [Updated_Host]      [nvarchar](100)  NULL,
        [Updated_User_ID]   [numeric](18, 0) NULL,
        [Updated_Date]      [datetime]       NULL,
     CONSTRAINT [PK_MM_Vehicle_Image_Mapping] PRIMARY KEY CLUSTERED
    (
        [Mapping_ID] ASC
    ) WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    ) ON [PRIMARY]

    PRINT 'Table MM_Vehicle_Image_Mapping created.'
END
ELSE
    PRINT 'Table MM_Vehicle_Image_Mapping already exists , skipped.'
GO

/*-------------------------------------------------------------------------------------------
    Foreign key : deleting one vehicle image removes all the locations mapped on it
-------------------------------------------------------------------------------------------*/
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE object_id = OBJECT_ID(N'[dbo].[FK_MM_Vehicle_Image_Mapping_Image]'))
BEGIN
    ALTER TABLE [dbo].[MM_Vehicle_Image_Mapping] WITH CHECK
        ADD CONSTRAINT [FK_MM_Vehicle_Image_Mapping_Image] FOREIGN KEY([Vehicle_Image_ID])
        REFERENCES [dbo].[MM_Vehicle_Image_Master] ([Vehicle_Image_ID])
        ON DELETE CASCADE

    PRINT 'Foreign key FK_MM_Vehicle_Image_Mapping_Image created.'
END
GO

/*-------------------------------------------------------------------------------------------
    Indexes
-------------------------------------------------------------------------------------------*/

-- one image name can be used only once for one Plant + Shop + Model
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MM_Vehicle_Image_Master_Name' AND object_id = OBJECT_ID(N'[dbo].[MM_Vehicle_Image_Master]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_MM_Vehicle_Image_Master_Name]
        ON [dbo].[MM_Vehicle_Image_Master] ([Plant_ID], [Shop_ID], [Model_ID], [Image_Name])
    PRINT 'Index UX_MM_Vehicle_Image_Master_Name created.'
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MM_Vehicle_Image_Master_Model' AND object_id = OBJECT_ID(N'[dbo].[MM_Vehicle_Image_Master]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_MM_Vehicle_Image_Master_Model]
        ON [dbo].[MM_Vehicle_Image_Master] ([Plant_ID], [Audit_Type_Id], [Shop_ID], [Model_ID])
    PRINT 'Index IX_MM_Vehicle_Image_Master_Model created.'
END
GO

-- one location can be mapped only once on one image
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'UX_MM_Vehicle_Image_Mapping_Location' AND object_id = OBJECT_ID(N'[dbo].[MM_Vehicle_Image_Mapping]'))
BEGIN
    CREATE UNIQUE NONCLUSTERED INDEX [UX_MM_Vehicle_Image_Mapping_Location]
        ON [dbo].[MM_Vehicle_Image_Mapping] ([Vehicle_Image_ID], [Location_ID])
    PRINT 'Index UX_MM_Vehicle_Image_Mapping_Location created.'
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_MM_Vehicle_Image_Mapping_Image' AND object_id = OBJECT_ID(N'[dbo].[MM_Vehicle_Image_Mapping]'))
BEGIN
    CREATE NONCLUSTERED INDEX [IX_MM_Vehicle_Image_Mapping_Image]
        ON [dbo].[MM_Vehicle_Image_Mapping] ([Vehicle_Image_ID])
    PRINT 'Index IX_MM_Vehicle_Image_Mapping_Image created.'
END
GO

PRINT 'Vehicle Image Master script completed.'
GO
