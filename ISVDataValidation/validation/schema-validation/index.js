// Required Modules
const fs = require('fs')
const yaml = require('js-yaml')
const Path = require("path")
const validateSchema = require('yaml-schema-validator')

// List of all the loaded templates of Apps
let Files = [];

// Function to recursively list the files inside the folder
function ReadThroughDirectory(Directory) {
    fs.readdirSync(Directory).forEach(File => {
        const Absolute = Path.join(Directory, File);
        if (fs.statSync(Absolute).isDirectory()) return ReadThroughDirectory(Absolute);
        else if(Absolute.endsWith('yaml')) return Files.push(Absolute);
    });
}

ReadThroughDirectory("templates/Apps");

const validatebooleanstring = val => {
    return val === 'true' || val === 'false'
}

const fixdetails = {
    Extensions: [{
        type: String,
    }],

    Exclude: [{
        type: String,
    }],

    EntryPointIssue: {
        type: String
    },

    Solution: [{
        type: String,
    }],

    Path: {
        type: String
    },

    ApplicationIds: [{
        type: String,
    }],

    Capabilities: [{
        type: String
    }],

    Dependencies: [{
        type: String,
    }],

    applications: [{

        id: {
            type: String
        },
        executable: {
            type: String
        },
        arguments: {
            type: String
        },
        workingDirectory: {
            type: String
        }

    }],

    processes: [{
        executable: {
            type: String
        },
        fixups: [{
            dll: {
                type: String
            },
            config: {
                redirectedPaths: {
                    packageRelative: [{
                        base: {
                            type: String
                        },
                        patterns: [{
                            type: String
                        }],
                        redirectTargetBase: {
                            type: String
                        },
                        isExclusion: {
                            type: String,
                            use: { validatebooleanstring }
                        },
                        isReadOnly: {
                            type: String,
                            use: { validatebooleanstring }
                        }
                    }],

                    packageDriveRelative: [{
                        base: {
                            type: String
                        },
                        patterns: [{
                            type: String
                        }],
                        redirectTargetBase: {
                            type: String
                        },
                        isExclusion: {
                            type: String,
                            use: { validatebooleanstring }
                        },
                        isReadOnly: {
                            type: String,
                            use: { validatebooleanstring }
                        }
                    }],

                    knownFolders: [{
                        id: {
                            type: String
                        },
                        relativePaths: [{
                            base: {
                                type: String
                            },
                            patterns: [{
                                type: String
                            }],
                            redirectTargetBase: {
                                type: String
                            },
                            isExclusion: {
                                type: String,
                                use: { validatebooleanstring }
                            },
                            isReadOnly: {
                                type: String,
                                use: { validatebooleanstring }
                            }
                        }]
                    }]
                }
            }
        }]
    }]


}



var msixSchema =   {
    PackageName: {
        type: String,
        required: true
    },

    PackageVersion: {
        required: true
    },

    PublisherName: {
        type: String,
        required: true
        
    },

    EligibleForConversion: {
        type: String,
        enum: ["Yes", "No - Driver Required", "No - Prohibited Application", "Can't Determine"],
        required: true
    },

    ConversionStatus: {
        type: String,
        enum: ["Successful - No Fix Required", "Successful - Fix Required", "Converted With Issues", "Failed", "Not Available", "Not Eligible"],
        required: true
    },

    RemediationApproach: [{
        SequenceNumber: {
            type: Number
        },

        Issue: {
            Description: {
                type: String
            },
            Reference: {
                type: String
            }
        },

        Fix: {
            FixType: {
                type: String,
                enum: ["Capability", "Dependency", "Extension", "InstallationPath", "Custom", "PSF", "Services", "EntryPoint"]
            },

            FixDetails: fixdetails,

            Reference: {
                type: String
            }

        }

    }],

    MinimumPSFVersion: {
        type: String
    },

    AdditionalComments: [{
        type: String
    }],

    Edition: {
        type: String,
        required: true
    },

    MinimumOSVersion: {
        type: String,
        required: true
    },

    MinimumOSBuild: {
        required: true
    },

    Architecture: {
        type: Number,
        enum: [32,64],
        required: true
    },

    MSIXConversionToolVersion: {
        type: String,
        required: true
    },

    TemplateVersion: {
        type: String,
        required: true
    }

}

// validating each templates against the msixSchema
var errors = [0,0]
var log_level = process.argv[2]

for (i = 0; i < Files.length; i++) {
    var file = Files[i]
    console.log('checking file ' + file)
    var err = validateSchema(file , {
        schema: msixSchema,
        logLevel: log_level
    }
    )
    errors[0] = err[0]
    errors[1] = err[1]
}

// total errors and warnings
console.log("\n\n-------------------------------------------\n" + "Total errors: " + errors[0] + " and warnings: " + errors[1]);

if (errors[0] != 0) {
    throw new Error('BUILD FAILED')
}
