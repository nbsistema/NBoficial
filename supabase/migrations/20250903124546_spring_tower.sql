-- Script para verificar usuários sem perfil
-- Execute este script para identificar usuários autenticados que não possuem perfil

-- Verificar usuários sem perfil
SELECT 
  au.id as user_id,
  au.email,
  au.created_at as user_created_at,
  CASE 
    WHEN up.user_id IS NULL THEN 'SEM PERFIL'
    ELSE 'COM PERFIL'
  END as status_perfil
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at DESC;

-- Contar usuários sem perfil
SELECT 
  COUNT(*) as total_usuarios_auth,
  COUNT(up.user_id) as usuarios_com_perfil,
  COUNT(*) - COUNT(up.user_id) as usuarios_sem_perfil
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.user_id
WHERE au.email_confirmed_at IS NOT NULL;

-- Verificar distribuição de roles
SELECT 
  role,
  COUNT(*) as quantidade
FROM user_profiles
GROUP BY role
ORDER BY quantidade DESC;