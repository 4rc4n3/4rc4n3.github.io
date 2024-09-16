export namespace API {
    export namespace aws {
        export const origin = 'https://tp69su7spl.execute-api.us-east-1.amazonaws.com';
        export const usage = `${origin}/usage`;
    }
    export namespace github {
        export const origin = 'https://api.github.com';
        export const user = `${origin}/user`;
        export const installations = `${origin}/user/installations`;
        export const repositories = `${origin}/user/installations/:id/repositories`;
    }
}
