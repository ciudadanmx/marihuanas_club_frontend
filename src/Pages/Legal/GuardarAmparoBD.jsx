import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, CircularProgress } from '@mui/material';

// GuardarAmparoBD
// Props:
// - uploadRes: object returned by /api/upload (must include fileId and raw)
// - userEmail: email to find the Strapi user by (optional if userId provided)
// - userId: optional Strapi user id to skip lookup
// - strapiUrl: base URL of Strapi (e.g. https://back.dominio.org)
// - token: optional Strapi bearer token
// - onStart, onProgress, onSuccess, onError: callbacks
// - children: button label (default: 'Guardar en Strapi')

export default function GuardarAmparoBD({
  uploadRes,
  userEmail,
  userId: providedUserId,
  strapiUrl,
  token = null,
  onStart = () => {},
  onProgress = () => {},
  onSuccess = () => {},
  onError = () => {},
  children = 'Guardar en Strapi',
  ...buttonProps
}) {
  const [loading, setLoading] = useState(false);

  // Helpers (local, self-contained) --------------------------------------------------
  async function findStrapiUserByEmail(baseUrl, email, tokenLocal = null) {
    console.log('[GuardarAmparoBD] Buscar usuario por email:', email);
    const base = baseUrl.replace(/\/$/, '');
    const url = `${base}/api/users?filters[email][$eq]=${encodeURIComponent(email)}`;
    const res = await fetch(url, { headers: tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {} });
    console.log('[GuardarAmparoBD] findUser status:', res.status);
    let json = null;
    try { json = await res.json(); } catch (e) { console.warn('[GuardarAmparoBD] findUser no JSON'); json = null; }
    console.log('[GuardarAmparoBD] findUser raw:', json);

    if (!json) return { found: false, raw: json };
    let arr = null;
    if (Array.isArray(json)) arr = json;
    else if (Array.isArray(json.data)) arr = json.data;
    else if (json.data && typeof json.data === 'object') arr = [json.data];
    else {
      const possible = Object.values(json).find(v => Array.isArray(v) && v.length > 0);
      if (possible) arr = possible;
    }
    if (!arr || arr.length === 0) return { found: false, raw: json };
    const first = arr[0];
    let id = first?.id || first?.attributes?.id || first?._id || first?.ID;
    if (!id) {
      for (const k of Object.keys(first)) {
        if (k.toLowerCase() === 'id' && first[k]) { id = first[k]; break; }
      }
    }
    return { found: true, id: id || null, raw: json, first };
  }

  async function updateStrapiUserMulti(baseUrl, userIdLocal, fileId, tokenLocal = null) {
    console.log('[GuardarAmparoBD] updateStrapiUserMulti:', userIdLocal, fileId);
    const base = baseUrl.replace(/\/$/, '');
    const endpoints = [
      `${base}/api/users/${userIdLocal}`,
      `${base}/api/plugins/users-permissions/users/${userIdLocal}`,
      `${base}/users/${userIdLocal}`
    ];

    const payloads = [
      { data: { demandaamparo: fileId, esperandoamparo: true, tipoamparo: 'autoamparo', amparostatus: 'autogenerado' } },
      { demandaamparo: fileId, esperandoamparo: true, tipoamparo: 'autoamparo', amparostatus: 'autogenerado' },
      { data: { demandaamparo: [fileId], esperandoamparo: true, tipoamparo: 'autoamparo', amparostatus: 'autogenerado' } },
      { demandaamparo: [fileId], esperandoamparo: true, tipoamparo: 'autoamparo', amparostatus: 'autogenerado' }
    ];

    const headers = { 'Content-Type': 'application/json', ...(tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {}) };

    for (const endpoint of endpoints) {
      for (const payload of payloads) {
        try {
          console.log('[GuardarAmparoBD] Intentando PUT ->', endpoint, payload);
          let res = await fetch(endpoint, { method: 'PUT', headers, body: JSON.stringify(payload) });
          console.log('[GuardarAmparoBD] PUT status', res.status, 'endpoint', endpoint);
          let parsed = null;
          try { parsed = await res.clone().json(); console.log('[GuardarAmparoBD] PUT json', parsed); }
          catch (e) { parsed = await res.clone().text().catch(()=>null); console.warn('[GuardarAmparoBD] PUT text', parsed); }

          if (res.ok) return { ok: true, method: 'PUT', endpoint, status: res.status, raw: parsed };

          console.warn('[GuardarAmparoBD] PUT not ok, trying PATCH ->', endpoint);
          res = await fetch(endpoint, { method: 'PATCH', headers, body: JSON.stringify(payload) });
          console.log('[GuardarAmparoBD] PATCH status', res.status, 'endpoint', endpoint);
          try { parsed = await res.clone().json(); console.log('[GuardarAmparoBD] PATCH json', parsed); }
          catch (e) { parsed = await res.clone().text().catch(()=>null); console.warn('[GuardarAmparoBD] PATCH text', parsed); }

          if (res.ok) return { ok: true, method: 'PATCH', endpoint, status: res.status, raw: parsed };

          console.warn('[GuardarAmparoBD] Neither PUT nor PATCH ok for', endpoint);
        } catch (err) {
          console.error('[GuardarAmparoBD] Error on endpoint', endpoint, err);
        }
      }
    }
    return { ok: false, error: 'No se pudo actualizar usuario con ninguna estrategia' };
  }

  async function verifyUserHasFileMulti(baseUrl, userIdLocal, tokenLocal = null) {
    const base = baseUrl.replace(/\/$/, '');
    const urls = [
      `${base}/api/users/${userIdLocal}?populate=demandaamparo`,
      `${base}/api/plugins/users-permissions/users/${userIdLocal}?populate=demandaamparo`,
      `${base}/api/users/${userIdLocal}?populate=*`,
      `${base}/api/plugins/users-permissions/users/${userIdLocal}?populate=*`
    ];

    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: tokenLocal ? { Authorization: `Bearer ${tokenLocal}` } : {} });
        let json = null;
        try { json = await res.clone().json(); } catch (e) { json = await res.clone().text().catch(()=>null); }
        const possible = (json && json.data && json.data.attributes && json.data.attributes.demandaamparo)
          || (json && json.data && json.data.demandaamparo)
          || (json && json.demandaamparo)
          || (Array.isArray(json) && json[0] && json[0].demandaamparo);
        if (possible) return { ok: true, url, raw: json, found: possible };
      } catch (err) {
        console.warn('[GuardarAmparoBD] verify error', err);
      }
    }
    return { ok: false };
  }

  // Click handler ---------------------------------------------------------------
  const handleClick = async () => {
    onStart();
    setLoading(true);
    try {
      onProgress({ step: 'start' });

      if (!uploadRes || (!uploadRes.fileId && !(uploadRes.raw && uploadRes.raw.id))) {
        throw new Error('uploadRes inválido: no contiene fileId. Pásale uploadRes.fileId o uploadRes.raw.id');
      }

      const fileId = uploadRes.fileId || (Array.isArray(uploadRes.raw) ? uploadRes.raw[0]?.id : uploadRes.raw?.id);
      onProgress({ step: 'file-ready', fileId, uploadRes });

      // determine userId
      let userId = providedUserId || null;
      if (!userId) {
        if (!userEmail) throw new Error('No se proporcionó userId ni userEmail para buscar en Strapi');
        onProgress({ step: 'find-user' });
        const found = await findStrapiUserByEmail(strapiUrl, userEmail, token);
        console.log('[GuardarAmparoBD] find result', found);
        if (!found.found || !found.id) throw new Error('No se encontró usuario en Strapi con ese email');
        userId = found.id;
        onProgress({ step: 'user-found', userId, found });
      }

      // update user with the media id
      onProgress({ step: 'updating-user', userId });
      const updateRes = await updateStrapiUserMulti(strapiUrl, userId, fileId, token);
      console.log('[GuardarAmparoBD] updateRes', updateRes);
      if (!updateRes || !updateRes.ok) throw new Error('No se pudo actualizar el usuario en Strapi: ' + (updateRes?.error || 'ver consola'));

      onProgress({ step: 'updated', updateRes });

      // verify
      onProgress({ step: 'verifying', userId });
      const verify = await verifyUserHasFileMulti(strapiUrl, userId, token);
      console.log('[GuardarAmparoBD] verify', verify);
      if (!verify.ok) throw new Error('Verificación fallida: la referencia no aparece en el usuario');

      onProgress({ step: 'verified', verify });
      onSuccess({ uploadRes, fileId, userId, updateRes, verify });
    } catch (err) {
      console.error('[GuardarAmparoBD] Error completo:', err);
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="contained" color="secondary" onClick={handleClick} disabled={loading} {...buttonProps}>
      {loading ? <><CircularProgress size={18} sx={{ mr: 1 }} />Procesando...</> : children}
    </Button>
  );
}

GuardarAmparoBD.propTypes = {
  uploadRes: PropTypes.object.isRequired,
  userEmail: PropTypes.string,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  strapiUrl: PropTypes.string.isRequired,
  token: PropTypes.string,
  onStart: PropTypes.func,
  onProgress: PropTypes.func,
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
  children: PropTypes.node
};
