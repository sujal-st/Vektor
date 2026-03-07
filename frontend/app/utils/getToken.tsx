export function getToken():string{
    return document.cookie.split(";").find(c=>c.trim().startsWith("token="))?.split("=")[1] ?? '';
}