'use client';

import React, { useState } from 'react';
import styled from 'styled-components';
import { weddingConfig } from '../../config/wedding-config';
import { AccountInfo } from '../../types/wedding';

type AccountPerson = 'groom' | 'bride' | 'groomFather' | 'groomMother' | 'brideFather' | 'brideMother';
type AccountSide = 'groom' | 'bride';

interface AccountSectionProps {
  bgColor?: 'white' | 'beige';
}

const AccountSection = ({ bgColor = 'white' }: AccountSectionProps) => {
  const [copyStatus, setCopyStatus] = useState<Record<AccountPerson, boolean>>({
    groom: false,
    bride: false,
    groomFather: false,
    groomMother: false,
    brideFather: false,
    brideMother: false,
  });
  
  // URL 복사 상태 관리
  const [urlCopied, setUrlCopied] = useState(false);

  // 계좌 그룹 열림/닫힘 상태 관리
  const [expandedSide, setExpandedSide] = useState<AccountSide | null>(null);

  const toggleSide = (side: AccountSide) => {
    if (expandedSide === side) {
      setExpandedSide(null);
    } else {
      setExpandedSide(side);
    }
  };

  /**
   * [핵심 기능] 안드로이드/카카오톡 인앱 브라우저 호환 복사 함수
   * navigator.clipboard가 실패하면 execCommand로 재시도합니다.
   */
  const secureCopy = async (text: string): Promise<boolean> => {
    try {
      // 1. 최신 브라우저 방식 시도
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // 2. 실패 시 (안드로이드 인앱 등) 레거시 방식 시도
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        
        // 화면 밖으로 숨김 처리
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
        console.error('복사 실패:', fallbackErr);
        return false;
      }
    }
  };

  // 계좌번호 복사 함수 (수정됨)
  const copyToClipboard = async (text: string, person: AccountPerson) => {
    const success = await secureCopy(text);
    
    if (success) {
      setCopyStatus({ ...copyStatus, [person]: true });
      setTimeout(() => {
        setCopyStatus({ ...copyStatus, [person]: false });
      }, 2000);
    } else {
      alert('복사에 실패했습니다. 계좌번호를 직접 복사해주세요.');
    }
  };
  
  // URL 복사 함수 (수정됨)
  const copyWebsiteUrl = async () => {
    const url = window.location.href;
    const success = await secureCopy(url);

    if (success) {
      setUrlCopied(true);
      // 안드로이드에서는 토스트 메시지 대신 alert가 확실할 때가 있음 (선택사항)
      alert('청첩장 주소가 복사되었습니다. 🌸'); 
      setTimeout(() => {
        setUrlCopied(false);
      }, 2000);
    } else {
      alert('URL 복사에 실패했습니다. 주소창을 이용해주세요.');
    }
  };
  
  // 웹 공유 API를 사용한 공유 함수 (수정됨)
  const shareWebsite = async () => {
    const shareData = {
      title: weddingConfig.meta.title,
      text: `${weddingConfig.invitation.groom.name} ♥ ${weddingConfig.invitation.bride.name}의 결혼식에 초대합니다`,
      url: window.location.href,
    };
    
    // 1. 공유 API 지원 여부 확인
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return; // 공유 성공 시 종료
      } catch (error) {
        // 사용자가 창을 닫거나 취소한 경우(AbortError)는 무시
        if ((error as Error).name === 'AbortError') return;
        // 그 외 에러 발생 시 아래 복사 로직으로 진입
      }
    }

    // 2. 공유 API가 없거나 실패한 경우 -> URL 복사 실행
    await copyWebsiteUrl();
  };

  // 각 인물에 해당하는 이름 가져오기
  const getPersonName = (person: AccountPerson): string => {
    switch(person) {
      case 'groom':
        return weddingConfig.invitation.groom.name;
      case 'bride':
        return weddingConfig.invitation.bride.name;
      case 'groomFather':
        return weddingConfig.invitation.groom.father;
      case 'groomMother':
        return weddingConfig.invitation.groom.mother;
      case 'brideFather':
        return weddingConfig.invitation.bride.father;
      case 'brideMother':
        return weddingConfig.invitation.bride.mother;
      default:
        return '';
    }
  };

  // 개별 계좌 정보 행 렌더링
  const renderAccountRow = (accountInfo: AccountInfo, person: AccountPerson, title: string) => {
    // 계좌 소유자 이름이 비어있는 경우 null 반환하여 렌더링하지 않음
    const personName = getPersonName(person);
    if (!personName || personName.trim() === '') {
      return null;
    }

    // 1줄: 은행명, 2줄: 계좌번호 + 예금주
    const bankText = accountInfo.bank;
    const numberAndHolder = `${accountInfo.number} ${accountInfo.holder}`;

    // 복사할 텍스트: '은행명 계좌번호 (예금주)'
    const copyText = `${accountInfo.bank} ${accountInfo.number} ${accountInfo.holder}`;

    return (
      <AccountRow>
        <AccountRowTitle>
          {title}
        </AccountRowTitle>
        <AccountRowInfo>
          <AccountBank>{bankText}</AccountBank>
          <AccountNumber>{numberAndHolder}</AccountNumber>
        </AccountRowInfo>
        <CopyButton
          onClick={(e) => {
            e.stopPropagation(); // 클릭 이벤트가 상위로 전파되지 않도록 방지
            copyToClipboard(copyText, person);
          }}
        >
          {copyStatus[person] ? '복사 완료' : '복사'}
        </CopyButton>
      </AccountRow>
    );
  };

  return (
    <AccountSectionContainer $bgColor={bgColor}>
      <SectionTitle>마음 전하실 곳</SectionTitle>
      
      <AccountCards>
        {/* 신랑측 계좌 카드 */}
        <AccountCard onClick={() => toggleSide('groom')}>
          <AccountCardHeader $isExpanded={expandedSide === 'groom'}>
            <GroupTitle>신랑 측 계좌번호</GroupTitle>
            <ExpandIcon $isExpanded={expandedSide === 'groom'}>
              {expandedSide === 'groom' ? '−' : '+'}
            </ExpandIcon>
          </AccountCardHeader>
          
          {expandedSide === 'groom' && (
            <AccountRowsContainer>
              {renderAccountRow(weddingConfig.account.groom, 'groom', '신랑')}
              {renderAccountRow(weddingConfig.account.groomFather, 'groomFather', '아버지')}
              {renderAccountRow(weddingConfig.account.groomMother, 'groomMother', '어머니')}
            </AccountRowsContainer>
          )}
        </AccountCard>
        
        {/* 신부측 계좌 카드 */}
        <AccountCard onClick={() => toggleSide('bride')}>
          <AccountCardHeader $isExpanded={expandedSide === 'bride'}>
            <GroupTitle>신부 측 계좌번호</GroupTitle>
            <ExpandIcon $isExpanded={expandedSide === 'bride'}>
              {expandedSide === 'bride' ? '−' : '+'}
            </ExpandIcon>
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
      
      {/* 청첩장 공유하기 버튼 */}
      <ShareContainer>
        <ShareButton onClick={copyWebsiteUrl}>
          {urlCopied ? '복사 완료!' : 'URL 복사하기'}
        </ShareButton>
        <ShareButton onClick={shareWebsite} $isShare={true}>
          공유하기
        </ShareButton>
      </ShareContainer>
    </AccountSectionContainer>
  );
};

// --- 스타일 정의 (보내주신 원본 유지) ---

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
    content: '';
    position: absolute;
    bottom: -16px;
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: var(--secondary-color);
  }
`;

const AccountCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 40rem;
  margin: 0 auto;
`;

const AccountCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 6px 10px rgba(0,0,0,0.1);
  }
`;

const AccountCardHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: ${props => props.$isExpanded ? '1px solid #eee' : 'none'};
`;

const GroupTitle = styled.h3`
  font-weight: 400;
  font-size: 1rem;
  color: #333;
  margin: 0;
  text-align: left;
  letter-spacing: 0.02em;
`;

const ExpandIcon = styled.span<{ $isExpanded: boolean }>`
  font-size: 1.5rem;
  line-height: 1;
  color: var(--secondary-color);
  transition: transform 0.3s ease;
  transform: ${props => props.$isExpanded ? 'rotate(0deg)' : 'rotate(0deg)'};
`;

const AccountRowsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f5f5f5;
  
  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 580px) {
    padding: 1rem 1rem;
  }

  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
  }

  @media (max-width: 380px) {
    padding: 1rem 0.55rem;
  }
`;

const AccountRowTitle = styled.div`
  font-weight: 500;
  font-size: 0.95rem;
  color: var(--secondary-color);
  min-width: 100px;
  text-align: left;

  @media (max-width: 580px) {
    min-width: 67.5px;
  }

  @media (max-width: 480px) {
    min-width: 55px;
  }
`;

const NameSpan = styled.span`
  font-weight: 400;
  font-size: 0.85rem;
  color: var(--text-medium);
`;

const AccountRowInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
  align-items: flex-start;
  gap: 0.1rem;
  min-width: 0;
`;

const AccountBank = styled.div`
  font-size: 0.95rem;
  color: var(--text-medium);
  white-space: nowrap;
  font-size: 0.85rem;
  line-height: 1.3;
  @media (max-width: 580px) {
    font-size: 0.75rem;
  }
`;

const AccountNumber = styled.div`
  font-weight: 500;
  font-size: clamp(0.7rem, 4vw, 1.1rem);
  color: var(--text-dark);
  font-size: 0.95rem;
  line-height: 1.3;
  word-break: break-all;
  @media (max-width: 580px) {
    font-size: 0.85rem;
  }
`;

const CopyButton = styled.button`
  background-color: transparent;
  border: 1px solid var(--secondary-color);
  color: var(--secondary-color);
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  white-space: nowrap;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  position: relative;
  overflow: hidden;
  
  &:hover, &:active {
    background-color: var(--secondary-color);
    color: white;
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:active:after {
    animation: ripple 0.6s ease-out;
  }
  
  @keyframes ripple {
    0% {
      transform: scale(0, 0);
      opacity: 0.5;
    }
    20% {
      transform: scale(25, 25);
      opacity: 0.3;
    }
    100% {
      opacity: 0;
      transform: scale(40, 40);
    }
  }
`;

const ShareContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ShareButton = styled.button<{ $isShare?: boolean }>`
  background-color: var(--secondary-color);
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  flex: 1;
  max-width: 180px;
  
  &:hover {
    background-color: #c4a986;
    box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(1px);
  }
  
  &:after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 5px;
    height: 5px;
    background: rgba(255, 255, 255, 0.5);
    opacity: 0;
    border-radius: 100%;
    transform: scale(1, 1) translate(-50%);
    transform-origin: 50% 50%;
  }
  
  &:active:after {
    animation: ripple 0.6s ease-out;
  }
`;

export default AccountSection;