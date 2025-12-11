from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime
from app.models.experiment import Experiment, ExperimentCreate, ExperimentUpdate

async def create_experiment(db: AsyncIOMotorDatabase, experiment: ExperimentCreate, owner_id: str) -> Experiment:
    experiment_dict = experiment.model_dump()
    experiment_dict["owner_id"] = owner_id
    experiment_dict["created_at"] = datetime.utcnow()
    
    result = await db["experiments"].insert_one(experiment_dict)
    
    created_experiment = await db["experiments"].find_one({"_id": result.inserted_id})
    return Experiment(**created_experiment)

async def get_multi_by_search(
    db: AsyncIOMotorDatabase, 
    query: str, 
    limit: int = 10
) -> List[Experiment]:
    # Case-insensitive regex search on title or description
    regex_query = {"$regex": query, "$options": "i"}
    mongo_query = {
        "$or": [
            {"title": regex_query},
            {"description": regex_query}
        ]
    }
    
    cursor = db["experiments"].find(mongo_query).limit(limit)
    experiments = await cursor.to_list(length=limit)
    return [Experiment(**e) for e in experiments]
