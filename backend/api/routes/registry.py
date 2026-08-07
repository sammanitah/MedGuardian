"""GET /api/v1/agents — list all registered domain agents."""
from fastapi import APIRouter, Depends

from backend.api.deps import get_agent_registry
from backend.core.agent_registry import AgentRegistry
from backend.core.schemas import AgentInfo

router = APIRouter()


@router.get(
    "/agents",
    response_model=list[AgentInfo],
    summary="List registered domain agents",
    description="Returns metadata for all domain agents auto-discovered at startup.",
)
async def list_agents(
    registry: AgentRegistry = Depends(get_agent_registry),
) -> list[AgentInfo]:
    return [
        AgentInfo(
            domain=agent.domain,
            display_name=agent.display_name,
            version=agent.version,
            description=agent.description,
        )
        for agent in registry.list_all()
    ]
