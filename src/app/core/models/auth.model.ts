export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    full_name: string;
    email: string;
    password: string;
    role: 'ADMIN_TALLER' | 'CLIENTE';
    ci?: string;
    phone?: string;
}

/** UserRead schema del backend — campos en inglés */
export interface UserAuth {
    id: number;
    role: 'ADMIN_TALLER' | 'SUPERADMIN' | 'CLIENTE';
    full_name: string;
    email: string;
    ci?: string;
    phone?: string;
    status?: 'ACTIVO' | 'INACTIVO';
    created_at?: string;
    updated_at?: string;
}

/** Login devuelve solo el token — el perfil se carga con GET /users/me */
export interface AuthResponse {
    access_token: string;
    token_type: string;
}

/** @deprecated Use UserAuth instead */
export type UsuarioAuth = UserAuth;

