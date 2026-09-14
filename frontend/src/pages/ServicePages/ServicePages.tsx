import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ChevronRight, MessageCircle, FileText, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header/Header';
import BackHeader from '@/components/Header/BackHeader';
import './ServicePages.css';
import { policyContent } from './policyContent';

const policies = [
  {
    id: 'terms',
    title: '이용약관',
    description: '서비스 이용에 관한 약속을 안내해요.',
    icon: FileText,
  },
  {
    id: 'privacy',
    title: '개인정보처리방침',
    description: '개인정보 처리에 관한 내용을 안내해요.',
    icon: ShieldCheck,
  },
];

function ServiceLayout({
  title,
  children,
  fallback = '/',
}: {
  title: string;
  children: ReactNode;
  fallback?: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="service-page">
      <Header />
      <div className="service-page__heading">
        <BackHeader
          title={title}
          onBack={() => (location.key === 'default' ? navigate(fallback) : navigate(-1))}
        />
      </div>
      <main className="service-page__body" aria-label={title}>
        {children}
      </main>
    </div>
  );
}

export function ContactPage() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const submitting = useRef(false);
  const [length, setLength] = useState(0);
  const [category, setCategory] = useState('');
  const [emailError, setEmailError] = useState('');
  const categoryMenu = useRef<HTMLDetailsElement>(null);
  async function sendInquiry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem('email') as HTMLInputElement;
    if (!category) {
      setMessage('문의 유형을 선택해 주세요.');
      categoryMenu.current?.querySelector('summary')?.focus();
      return;
    }
    if (!emailInput.validity.valid) {
      setEmailError('올바른 이메일 주소를 입력해 주세요.');
      emailInput.focus();
      return;
    }
    const data = new FormData(form);
    const title = String(data.get('title') ?? '').trim();
    const content = String(data.get('content') ?? '').trim();
    if (!title || !content) {
      setMessage('제목과 문의 내용을 공백 없이 입력해 주세요.');
      return;
    }
    submitting.current = true;
    setSending(true);
    setMessage('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          email: String(data.get('email') ?? '').trim(),
          title,
          content,
        }),
      });
      if (!response.ok) {
        const errors: Record<number, string> = {
          400: '문의 입력 내용을 확인해 주세요.',
          429: '잠시 후 다시 보내 주세요. (최대 1분 대기)',
          503: '현재 문의를 접수할 수 없습니다. 잠시 후 다시 시도해 주세요.',
        };
        setMessage(errors[response.status] ?? '문의 전송에 실패했어요. 입력 내용은 유지됩니다.');
        return;
      }
      form.reset();
      setCategory('');
      setLength(0);
      setEmailError('');
      setMessage('문의가 전송되었습니다. 작성하신 이메일로 답변을 받으실 수 있어요.');
    } catch {
      setMessage(
        '전송 결과를 확인하지 못했어요. 입력 내용은 유지됩니다. 네트워크 연결을 확인해 주세요.',
      );
    } finally {
      submitting.current = false;
      setSending(false);
    }
  }

  return (
    <ServiceLayout title="문의하기">
      <section className="service-page__intro">
        <span className="service-page__icon">
          <MessageCircle size={28} aria-hidden="true" />
        </span>
        <div className="service-page__intro-text">
          <h1>궁금한 점을 남겨주세요</h1>
          <p>이용 중 불편한 점이나 서비스에 대한 의견을 작성해 주세요.</p>
        </div>
      </section>
      <form
        noValidate
        className="contact-form"
        aria-busy={sending}
        onSubmit={sendInquiry}
        onChange={() => setMessage('')}
      >
        <fieldset disabled={sending} inert={sending} className="contact-form contact-form__fields">
          <span id="contact-category-label" className="contact-form__label">
            문의 유형 <span aria-hidden="true">*</span>
          </span>
          <input type="hidden" name="category" value={category} />
          <details
            className="contact-category"
            ref={categoryMenu}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget))
                event.currentTarget.open = false;
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                event.currentTarget.open = false;
                event.currentTarget.querySelector('summary')?.focus();
              }
            }}
          >
            <summary aria-labelledby="contact-category-label contact-category-value">
              <span id="contact-category-value">{category || '문의 유형을 선택해 주세요'}</span>
              <ChevronRight size={16} aria-hidden="true" />
            </summary>
            <div className="contact-category__options" role="group" aria-label="문의 유형 선택">
              {['서비스 이용', '로그인 및 계정', '정보 오류 제보', '개선 제안', '기타 문의'].map(
                (option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={category === option}
                    onClick={() => {
                      setCategory(option);
                      setMessage('');
                      if (categoryMenu.current) {
                        categoryMenu.current.open = false;
                        categoryMenu.current.querySelector('summary')?.focus();
                      }
                    }}
                  >
                    {option}
                  </button>
                ),
              )}
            </div>
          </details>
          <label htmlFor="contact-email">
            답변 받을 이메일 <span aria-hidden="true">*</span>
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            aria-invalid={emailError ? true : undefined}
            aria-describedby={emailError ? 'contact-email-error' : undefined}
            onChange={() => setEmailError('')}
            onBlur={(event) =>
              setEmailError(
                event.target.value && !event.target.validity.valid
                  ? '올바른 이메일 주소를 입력해 주세요.'
                  : '',
              )
            }
            placeholder="example@email.com"
            maxLength={254}
            required
          />
          {emailError && (
            <p id="contact-email-error" className="contact-form__error" role="alert">
              {emailError}
            </p>
          )}
          <label htmlFor="contact-title">
            제목 <span aria-hidden="true">*</span>
          </label>
          <input
            id="contact-title"
            name="title"
            placeholder="문의 제목을 입력해 주세요"
            maxLength={100}
            required
          />
          <label htmlFor="contact-content">
            문의 내용 <span aria-hidden="true">*</span>
          </label>
          <textarea
            id="contact-content"
            name="content"
            rows={8}
            maxLength={2000}
            required
            aria-describedby="contact-help contact-count"
            placeholder="어떤 점이 궁금하거나 불편하셨나요? 오류가 발생한 화면과 상황을 함께 적어 주세요."
            onChange={(event) => setLength(event.target.value.length)}
          />
          <div className="contact-form__meta">
            <span id="contact-help">비밀번호 등 민감한 정보는 입력하지 마세요.</span>
            <span id="contact-count">{length} / 2,000</span>
          </div>
          <button type="submit" className="contact-form__submit" disabled={sending}>
            {sending ? '전송 중…' : '문의 보내기'}
          </button>
        </fieldset>
        <p className="contact-form__hint">
          작성하신 이메일과 문의 내용은 문의 확인 및 답변을 위해 관리자에게 이메일로 전달됩니다.
        </p>
        <p role="status" className="contact-form__status">
          {message}
        </p>
      </form>
    </ServiceLayout>
  );
}

export function PoliciesPage() {
  return (
    <ServiceLayout title="약관 및 정책">
      <p className="service-page__description">
        인천구로의 서비스 이용과 개인정보 보호에 관한 안내입니다.
      </p>
      <nav className="service-page__list" aria-label="약관 및 정책 목록">
        {policies.map(({ id, title, description, icon: Icon }) => (
          <Link key={id} to={'/policies/' + id} className="service-page__row">
            <Icon size={22} aria-hidden="true" />
            <span>
              <strong>{title}</strong>
              <span>{description}</span>
            </span>
            <ChevronRight size={18} aria-hidden="true" />
          </Link>
        ))}
      </nav>
    </ServiceLayout>
  );
}

export function PolicyDetailPage() {
  const { policyId } = useParams();
  const policy = policies.find((item) => item.id === policyId);
  return (
    <ServiceLayout title={policy?.title ?? '문서를 찾을 수 없어요'} fallback="/policies">
      {policy ? (
        <article className="service-policy">
          {(policy.id === 'terms' ? policyContent.terms : policyContent.privacy).map(
            ([heading, content]) => (
              <section className="service-policy__section" key={heading}>
                <h2>{heading}</h2>
                <p>{content}</p>
              </section>
            ),
          )}
        </article>
      ) : (
        <p>요청하신 문서가 없어요. 약관 및 정책 목록에서 다시 선택해 주세요.</p>
      )}
      <Link to="/policies" className="service-page__back-link">
        약관 및 정책 목록으로
      </Link>
    </ServiceLayout>
  );
}
