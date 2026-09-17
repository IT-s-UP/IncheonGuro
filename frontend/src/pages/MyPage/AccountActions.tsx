import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import './AccountActions.css';

export default function AccountActions() {
  const { user, logout, withdraw } = useAuth();
  const navigate = useNavigate();
  const dialog = useRef<HTMLDialogElement>(null);
  const busyRef = useRef(false);
  const [action, setAction] = useState<'logout' | 'withdraw' | null>(null);
  const [busy, setBusy] = useState(false);
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { if (action) dialog.current?.showModal(); else dialog.current?.close(); }, [action]);
  if (!user) return null;
  function close() { if (!busyRef.current) { setAction(null); setPassword(''); setAgreed(false); setError(''); } }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    try {
      if (action === 'withdraw') await withdraw(password); else await logout();
      navigate('/', { replace: true });
    } catch (err) { setError(err instanceof Error ? err.message : '요청을 완료하지 못했습니다. 다시 시도해 주세요.'); }
    finally { busyRef.current = false; setBusy(false); }
  }
  return <section className="account-actions" aria-label="계정 관리">
    <button type="button" onClick={() => setAction('logout')}>로그아웃</button>
    <button type="button" onClick={() => setAction('withdraw')}>회원 탈퇴</button>
    <dialog ref={dialog} className="account-dialog" aria-labelledby="account-title"
      onCancel={(event) => { event.preventDefault(); close(); }}>
      <form onSubmit={submit}>
        <h2 id="account-title">{action === 'withdraw' ? '정말 탈퇴하시겠어요?' : '로그아웃하시겠어요?'}</h2>
        {action === 'withdraw' ? <>
          <p>회원 정보, 내 코스와 일정·장소, 스탬프와 지역 방문 기록, 코스·장소 북마크가 삭제되며 복구할 수 없습니다.</p>
          <p>카카오·구글 계정 자체는 삭제되지 않습니다. 다시 소셜 로그인하면 새 회원으로 가입됩니다.</p>
          <p>기존 문의 메일은 별도로 처리됩니다. 삭제가 필요하면 문의해 주세요.</p>
          {user.provider === 'local' && <label>현재 비밀번호
            <input type="password" autoComplete="current-password" required maxLength={200}
              value={password} onChange={e => setPassword(e.target.value)} disabled={busy} />
          </label>}
          <label className="account-dialog__agree"><input type="checkbox" required checked={agreed}
            onChange={e => setAgreed(e.target.checked)} disabled={busy} />삭제 내용을 확인했으며 탈퇴에 동의합니다.</label>
        </> : <p>이 기기의 인천구로 로그인 상태를 종료합니다.</p>}
        {error && <p role="alert" className="account-dialog__error">{error}</p>}
        <div className="account-dialog__buttons">
          <button type="button" disabled={busy} onClick={close}>취소</button>
          <button type="submit" disabled={busy || (action === 'withdraw' && !agreed)}>
            {busy ? '처리 중…' : action === 'withdraw' ? '탈퇴하기' : '로그아웃'}
          </button>
        </div>
      </form>
    </dialog>
  </section>;
}
