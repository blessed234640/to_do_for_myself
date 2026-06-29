from fastapi import APIRouter, Depends, status
from app.schemas.task import TaskCreate, TaskOut
from app.services.task_service import TaskService
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
    return await service.create_task(title=payload.title, remind_at=payload.remind_at)


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
):
    return await service.get_task(task_id)


@router.put("/{task_id}", response_model=TaskOut)
async def update_task(
    task_id: int,
    payload: TaskCreate,
    service: TaskService = Depends(get_task_service),
):
    return await service.update_task(
        task_id=task_id,
        title=payload.title,
        remind_at=payload.remind_at,
    )


@router.post("/{task_id}/complete", response_model=TaskOut)
async def complete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
):
    return await service.complete_task(task_id)


@router.delete("/{task_id}", response_model=TaskOut)
async def delete_task(
    task_id: int,
    service: TaskService = Depends(get_task_service),
):
    return await service.delete_task(task_id)
