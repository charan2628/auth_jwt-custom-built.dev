export function confirmCode(code: string, username: string): string {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>CUSTOM-BUILT DEV</title>
        </head>
        <body>
            <h1>Confirmation code</h1>
                <p>username: ${username}</p>
                <p>code: ${code}</p>
        </body>
    </html>
    `
}

export function forgotPassword(code: string, username: string): string {
    return `
    <!DOCTYPE html>
    <html>
        <head>
            <title>CUSTOM-BUILT DEV</title>
        </head>
        <body>
            <h1>Forgot Password</h1>
                <p>username: ${username}</p>
                <p>code: ${code}</p>
        </body>
    </html>
    `
}

export default {
    confirmCode,
    forgotPassword
};