import PermissionFailed from "../shared_components/permission_failed"

function checkForPermission(userPermissions, permissionName) {
    if(permissionName in userPermissions) {
        return
    } else {
        return <PermissionFailed />
    }
}

function checkForSuperuser(globalContext) {
    if(globalContext.superuser) {
        return
    } else {
        return <PermissionFailed />
    }
}


export {checkForPermission, checkForSuperuser}