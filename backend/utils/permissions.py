from fastapi import Depends, HTTPException, status
from utils.dependencies import get_current_user


def require_roles(roles: list):
    def checker(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permission denied"
            )
        return current_user

    return checker