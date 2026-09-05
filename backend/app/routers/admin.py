from fastapi import APIRouter, HTTPException

from app.database.mongodb import (
    users_collection,
    predictions_collection,
    soil_collection
)


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


# =========================================================
# ADMIN STATISTICS
# =========================================================

@router.get("/stats")
async def get_admin_stats():

    try:

        # =================================================
        # TOTAL USERS
        # =================================================

        total_users = await users_collection.count_documents({})


        # =================================================
        # FARMERS
        # =================================================

        total_farmers = await users_collection.count_documents(
            {
                "role": "farmer"
            }
        )


        total_farms = total_farmers


        # =================================================
        # TOTAL LAND
        # Only count valid positive land values
        # =================================================

        land_pipeline = [

            {
                "$match": {

                    "role": "farmer",

                    "land_area": {
                        "$exists": True,
                        "$nin": [
                            None,
                            "",
                            0,
                            "0"
                        ]
                    }
                }
            },

            {
                "$addFields": {

                    "numeric_land": {

                        "$convert": {

                            "input": "$land_area",

                            "to": "double",

                            "onError": 0,

                            "onNull": 0
                        }
                    }
                }
            },

            {
                "$group": {

                    "_id": None,

                    "total": {
                        "$sum": "$numeric_land"
                    }
                }
            }
        ]


        land_result = await users_collection.aggregate(
            land_pipeline
        ).to_list(length=1)


        total_land = 0

        if land_result:

            total_land = round(
                land_result[0].get(
                    "total",
                    0
                ),
                2
            )


        # =================================================
        # PREDICTIONS
        # =================================================

        total_predictions = await predictions_collection.count_documents({})


        # =================================================
        # SOIL ANALYSES
        # =================================================

        total_soil_analyses = await soil_collection.count_documents({})


        # =================================================
        # CROP DISTRIBUTION
        # =================================================

        crop_pipeline = [

            {
                "$match": {

                    "crop": {
                        "$exists": True,
                        "$nin": [
                            None,
                            ""
                        ]
                    }
                }
            },

            {
                "$group": {

                    "_id": "$crop",

                    "count": {
                        "$sum": 1
                    }
                }
            },

            {
                "$sort": {
                    "count": -1
                }
            }
        ]


        crop_result = await predictions_collection.aggregate(
            crop_pipeline
        ).to_list(length=100)


        crop_distribution = [

            {
                "crop": item["_id"],

                "count": item["count"]
            }

            for item in crop_result
        ]


        # =================================================
        # FARMERS BY LOCATION
        # =================================================

        location_pipeline = [

            {
                "$match": {
                    "role": "farmer"
                }
            },

            {
                "$group": {

                    "_id": {

                        "$cond": [

                            {
                                "$or": [

                                    {
                                        "$eq": [
                                            "$state",
                                            None
                                        ]
                                    },

                                    {
                                        "$eq": [
                                            "$state",
                                            ""
                                        ]
                                    }
                                ]
                            },

                            "Location Not Provided",

                            "$state"
                        ]
                    },

                    "count": {
                        "$sum": 1
                    }
                }
            },

            {
                "$sort": {
                    "count": -1
                }
            }
        ]


        location_result = await users_collection.aggregate(
            location_pipeline
        ).to_list(length=100)


        farmers_by_location = [

            {
                "state": item["_id"],

                "count": item["count"]
            }

            for item in location_result
        ]


        # =================================================
        # RECENT FARMERS
        # =================================================

        farmer_records = await users_collection.find(

            {
                "role": "farmer"
            },

            {
                "password": 0
            }

        ).sort(

            "_id",
            -1

        ).limit(

            10

        ).to_list(

            length=10
        )


        recent_farmers = []


        for farmer in farmer_records:

            land = farmer.get(
                "land_area",
                0
            )

            state = farmer.get(
                "state",
                ""
            )

            district = farmer.get(
                "district",
                ""
            )

            village = farmer.get(
                "village",
                ""
            )

            location_parts = [

                value

                for value in [
                    village,
                    district,
                    state
                ]

                if value
            ]


            location = (
                ", ".join(location_parts)
                if location_parts
                else "Location Not Provided"
            )


            recent_farmers.append({

                "_id": str(
                    farmer["_id"]
                ),

                "name": farmer.get(
                    "full_name",
                    "Unknown Farmer"
                ),

                "email": farmer.get(
                    "email",
                    ""
                ),

                "location": location,

                "village": village,

                "mandal": farmer.get(
                    "mandal",
                    ""
                ),

                "district": district,

                "state": state,

                "country": farmer.get(
                    "country",
                    ""
                ),

                "land_area": land,

                "land_unit": farmer.get(
                    "land_unit",
                    "acres"
                ),

                "crop": farmer.get(
                    "crop",
                    ""
                ),

                "created_at": farmer.get(
                    "created_at",
                    None
                )
            })


        # =================================================
        # RESPONSE
        # =================================================

        return {

            "total_users":
                total_users,

            "total_farmers":
                total_farmers,

            "total_farms":
                total_farms,

            "total_land":
                total_land,

            "total_predictions":
                total_predictions,

            "total_soil_analyses":
                total_soil_analyses,

            "crop_distribution":
                crop_distribution,

            "farmers_by_location":
                farmers_by_location,

            "recent_farmers":
                recent_farmers
        }


    except Exception as e:

        print("=" * 60)
        print("ADMIN DASHBOARD ERROR")
        print(str(e))
        print("=" * 60)

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )