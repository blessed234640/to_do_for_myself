from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.task import TaskCreate, TaskOut
from app.services.task_service import TaskService
from app.services.exceptions import PastReminderError, TaskNotFoundError
from app.api.deps import get_task_service

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("", response_model=list[TaskOut])
async def list_tasks(service: TaskService = Depends(get_task_service)):
    return await service.list_tasks()


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
async def create_task(
    payload: TaskCreate,
    service: TaskService = Depends(get_task_service),
):
    try:
        return await service.create_task(title=payload.title, remind_at=payload.remind_at)
    except PastReminderError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
):
    try:
        return await service.get_task(task_id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    

@router.put("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: int,
    payload: TaskCreate,
    service: TaskService = Depends(get_task_service),
):
    try:
        return await service.update_task(
            task_id=task_id,
            title=payload.title,
            remind_at=payload.remind_at,
        )
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except PastReminderError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
@router.delete("/{task_id}", response_model=TaskOut)
async def delete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
):
    try:
        return await service.delete_task(task_id)
    except TaskNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))