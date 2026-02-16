'use client';

import React, { useState } from 'react';
import Script from 'next/script'; // [필수] 카카오 SDK 로드용 스크립트
import styled from 'styled-components';
import { weddingConfig } from '../../config/wedding-config';
import { AccountInfo } from '../../types/wedding';

// [필수] window.Kakao 타입 선언 (TypeScript 에러 방지)
declare global {
  interface Window {
    Kakao: any;
  }
}

type AccountPerson = 'groom' | 'bride' | 'groomFather' | 'groomMother' | 'brideFather' | 'brideMother';
type AccountSide = 'groom' | 'bride';

interface AccountSectionProps {
  bgColor?: 'white' | 'beige';
}

const AccountSection = ({ bgColor = 'white' }: AccountSectionProps) => {
  // ⚠️ [중요] 카카오 개발자 센터에서 발급받은 'JavaScript 키'를 여기에 넣으세요!
  const kakaoApiKey = '57ee06c88eda46cfb7c378eaa01699de'; 

  const [copyStatus, setCopyStatus] = useState<Record<AccountPerson, boolean>>({
    groom: false, bride: false, groomFather: false, groomMother: false, brideFather: false, brideMother: false,
  });
  
  const [urlCopied, setUrlCopied] = useState(false);
  const [expandedSide, setExpandedSide] = useState<AccountSide | null>(null);

  const toggleSide = (side: AccountSide) => {
    setExpandedSide(expandedSide === side ? null : side);
  };

  const secureCopy = async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        textArea.style.top = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        return success;
      } catch (fallbackErr) {
        return false;
      }
    }
  };

  const copyToClipboard = async (text: string, person: AccountPerson) => {
    const success = await secureCopy(text);
    if (success) {
      setCopyStatus({ ...copyStatus, [person]: true });
      setTimeout(() => setCopyStatus({ ...copyStatus, [person]: false }), 2000);
    } else {
      alert('복사에 실패했습니다. 계좌번호를 직접 복사해주세요.');
    }
  };
  
  const copyWebsiteUrl = async () => {
    const url = window.location.href;
    const success = await secureCopy(url);
    if (success) {
      setUrlCopied(true);
      alert('청첩장 주소가 복사되었습니다. 🌸'); 
      setTimeout(() => setUrlCopied(false), 2000);
    } else {
      alert('URL 복사에 실패했습니다.');
    }
  };
  
  // ▼▼▼ [수정됨] 카카오톡 전용 공유 함수 (버튼 2개 버전) ▼▼▼
 const shareToKakao = () => {
  // layout.tsx에서 이미 초기화했으므로 바로 사용 가능
  if (window.Kakao) {
    window.Kakao.Share.sendCustom({
      templateId: 127493, // 👈 방금 만든 템플릿 ID 숫자를 여기에 넣으세요
      templateArgs: {
        // (선택사항) 템플릿 내용을 동적으로 바꾸고 싶을 때 사용
        // title: '대웅 ♥ 근영 결혼합니다', 
        // description: '3월 14일 토요일'
      },
    });
  }
};

  // ... (이름 가져오기 및 렌더링 함수는 기존 유지) ...
  const getPersonName = (person: AccountPerson): string => {
    switch(person) {
      case 'groom': return weddingConfig.invitation.groom.name;
      case 'bride': return weddingConfig.invitation.bride.name;
      case 'groomFather': return weddingConfig.invitation.groom.father;
      case 'groomMother': return weddingConfig.invitation.groom.mother;
      case 'brideFather': return weddingConfig.invitation.bride.father;
      case 'brideMother': return weddingConfig.invitation.bride.mother;
      default: return '';
    }
  };

  const renderAccountRow = (accountInfo: AccountInfo, person: AccountPerson, title: string) => {
    const personName = getPersonName(person);
    if (!personName || personName.trim() === '') return null;

    const bankText = accountInfo.bank;
    const numberAndHolder = `${accountInfo.number} ${accountInfo.holder}`;
    const copyText = `${accountInfo.bank} ${accountInfo.number} ${accountInfo.holder}`;

    return (
      <AccountRow>
        <AccountRowTitle>{title}</AccountRowTitle>
        <AccountRowInfo>
          <AccountBank>{bankText}</AccountBank>
          <AccountNumber>{numberAndHolder}</AccountNumber>
        </AccountRowInfo>
        <CopyButton onClick={(e) => { e.stopPropagation(); copyToClipboard(copyText, person); }}>
          {copyStatus[person] ? '복사 완료' : '복사'}
        </CopyButton>
      </AccountRow>
    );
  };

  return (
    <>
      {/* [필수] 카카오 SDK 스크립트 로드 */}
      <Script
        src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.1/kakao.min.js"
        integrity="sha384-kDljxUXHaJ9xAb2AzRd59KxjrFjzHa5TAoFQ6GbYTCAG0bjM55XohjjDT7tDDC01"
        crossOrigin="anonymous"
        onLoad={() => {
          if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(kakaoApiKey);
          }
        }}
      />

      <AccountSectionContainer $bgColor={bgColor}>
        <SectionTitle>마음 전하실 곳</SectionTitle>
        
        <AccountCards>
          <AccountCard onClick={() => toggleSide('groom')}>
            <AccountCardHeader $isExpanded={expandedSide === 'groom'}>
              <GroupTitle>신랑 측 계좌번호</GroupTitle>
              <ExpandIcon $isExpanded={expandedSide === 'groom'}>{expandedSide === 'groom' ? '−' : '+'}</ExpandIcon>
            </AccountCardHeader>
            {expandedSide === 'groom' && (
              <AccountRowsContainer>
                {renderAccountRow(weddingConfig.account.groom, 'groom', '신랑')}
                {renderAccountRow(weddingConfig.account.groomFather, 'groomFather', '아버지')}
                {/* {renderAccountRow(weddingConfig.account.groomMother, 'groomMother', '어머니')} */}
              </AccountRowsContainer>
            )}
          </AccountCard>
          
          <AccountCard onClick={() => toggleSide('bride')}>
            <AccountCardHeader $isExpanded={expandedSide === 'bride'}>
              <GroupTitle>신부 측 계좌번호</GroupTitle>
              <ExpandIcon $isExpanded={expandedSide === 'bride'}>{expandedSide === 'bride' ? '−' : '+'}</ExpandIcon>
            </AccountCardHeader>
            {expandedSide === 'bride' && (
              <AccountRowsContainer>
                {renderAccountRow(weddingConfig.account.bride, 'bride', '신부')}
                {renderAccountRow(weddingConfig.account.brideFather, 'brideFather', '아버지')}
                {renderAccountRow(weddingConfig.account.brideMother, 'brideMother', '어머니')}
              </AccountRowsContainer>
            )}
          </AccountCard>
        </AccountCards>
        
        <ShareContainer>
          <ShareButton onClick={copyWebsiteUrl}>
            {urlCopied ? '복사 완료!' : 'URL 복사하기'}
          </ShareButton>
          
          {/* ▼▼▼ 여기가 변경된 부분 (함수 교체 & 스타일) ▼▼▼ */}
          <ShareButton onClick={shareToKakao} $isShare={true}>
            카카오톡 공유
          </ShareButton>
        </ShareContainer>
      </AccountSectionContainer>
    </>
  );
};

// --- 스타일 정의 (기존 코드와 동일) ---
const AccountSectionContainer = styled.section<{ $bgColor: 'white' | 'beige' }>`
  padding: 4rem 1.5rem;
  text-align: center;
  background-color: ${props => props.$bgColor === 'beige' ? '#F8F6F2' : 'white'};
`;
const SectionTitle = styled.h2`
  position: relative;
  display: inline-block;
  margin-bottom: 2rem;
  font-weight: 500;
  font-size: 1.5rem;
  &::after {
    content: ''; position: absolute; bottom: -16px; left: 50%; transform: translateX(-50%);
    width: 6px; height: 6px; border-radius: 50%; background-color: var(--secondary-color);
  }
`;
const AccountCards = styled.div`
  display: flex; flex-direction: column; gap: 1.5rem; max-width: 40rem; margin: 0 auto;
`;
const AccountCard = styled.div`
  background-color: white; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; cursor: pointer; transition: all 0.2s ease;
  &:hover { box-shadow: 0 6px 10px rgba(0,0,0,0.1); }
`;
const AccountCardHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex; justify-content: space-between; align-items: center; padding: 1.25rem;
  border-bottom: ${props => props.$isExpanded ? '1px solid #eee' : 'none'};
`;
const GroupTitle = styled.h3`
  font-weight: 400; font-size: 1rem; color: #333; margin: 0; text-align: left; letter-spacing: 0.02em;
`;
const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 1.5rem; line-height: 1; color: var(--secondary-color); transition: transform 0.3s ease;
  transform: ${props => props.$isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'};
`;
const AccountRowsContainer = styled.div`display: flex; flex-direction: column;`;
const AccountRow = styled.div`
  display: flex; align-items: center; padding: 1rem 1.25rem; border-bottom: 1px solid #f5f5f5;
  &:last-child { border-bottom: none; }
  @media (max-width: 580px) { padding: 1rem 1rem; }
  @media (max-width: 480px) { padding: 1rem 0.75rem; }
  @media (max-width: 380px) { padding: 1rem 0.55rem; }
`;
const AccountRowTitle = styled.div`
  font-weight: 500; font-size: 0.95rem; color: var(--secondary-color); min-width: 100px; text-align: left;
  @media (max-width: 580px) { min-width: 67.5px; }
  @media (max-width: 480px) { min-width: 55px; }
`;
const AccountRowInfo = styled.div`
  display: flex; flex-direction: column; flex: 1; justify-content: center; align-items: flex-start; gap: 0.1rem; min-width: 0;
`;
const AccountBank = styled.div`
  font-size: 0.95rem; color: var(--text-medium); white-space: nowrap; font-size: 0.85rem; line-height: 1.3;
  @media (max-width: 580px) { font-size: 0.75rem; }
`;
const AccountNumber = styled.div`
  font-weight: 500; font-size: clamp(0.7rem, 4vw, 1.1rem); color: var(--text-dark); font-size: 0.95rem; line-height: 1.3; word-break: break-all;
  @media (max-width: 580px) { font-size: 0.85rem; }
`;
const CopyButton = styled.button`
  background-color: transparent; border: 1px solid var(--secondary-color); color: var(--secondary-color);
  padding: 0.35rem 0.5rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; white-space: nowrap;
  transition: all 0.2s ease; margin-left: 0.5rem; position: relative; overflow: hidden;
  &:hover, &:active { background-color: var(--secondary-color); color: white; }
  &:active { transform: translateY(1px); }
  &:after {
    content: ''; position: absolute; top: 50%; left: 50%; width: 5px; height: 5px; background: rgba(255, 255, 255, 0.5);
    opacity: 0; border-radius: 100%; transform: scale(1, 1) translate(-50%); transform-origin: 50% 50%;
  }
  &:active:after { animation: ripple 0.6s ease-out; }
  @keyframes ripple {
    0% { transform: scale(0, 0); opacity: 0.5; }
    20% { transform: scale(25, 25); opacity: 0.3; }
    100% { opacity: 0; transform: scale(40, 40); }
  }
`;
const ShareContainer = styled.div`margin-top: 2rem; display: flex; justify-content: center; gap: 1rem;`;
const ShareButton = styled.button<{ $isShare?: boolean }>`
  background-color: var(--secondary-color); color: white; border: none; border-radius: 4px;
  padding: 0.75rem 1.5rem; font-size: 1rem; cursor: pointer; transition: all 0.2s ease;
  position: relative; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); flex: 1; max-width: 180px;
  &:hover { background-color: #c4a986; box-shadow: 0 2px 5px rgba(0,0,0,0.15); }
  &:active { transform: translateY(1px); }
  &:after {
    content: ''; position: absolute; top: 50%; left: 50%; width: 5px; height: 5px; background: rgba(255, 255, 255, 0.5);
    opacity: 0; border-radius: 100%; transform: scale(1, 1) translate(-50%); transform-origin: 50% 50%;
  }
  &:active:after { animation: ripple 0.6s ease-out; }
`;

export default AccountSection;