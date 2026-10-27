'use client';

import React, { useState, type FC } from 'react';
import { motion, MotionConfig, type Transition } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import useMeasure from 'react-use-measure';

export interface AccordionItemData {
  id: number;
  title: string;
  icon?: React.ReactNode;
  content: string;
}

interface AccordionItemProps {
  item: AccordionItemData;
  setOpenId: (id: number | null) => void;
  index: number;
  total: number;
  openIndex: number;
}

export interface AccordionProps {
  items: AccordionItemData[];
}

const springTransition: Transition = {
  type: 'spring',
  stiffness: 600,
  damping: 50,
  mass: 1,
};

const AccordionItem: FC<AccordionItemProps> = ({
  item,
  setOpenId,
  index,
  total,
  openIndex,
}) => {
  const [ref, bounds] = useMeasure();
  const isOpen = index === openIndex;

  const isFirst = index === 0;
  const isLast = index === total - 1;

  const isBeforeOpen = index === openIndex - 1;
  const isAfterOpen = index === openIndex + 1;

  const isAlone = (isAfterOpen && isLast) || (isBeforeOpen && isFirst);

  const BORDER_WIDTH = '1px';
  const BORDER_STYLE = 'solid';
  const borderTopWidth =
    isFirst || isAfterOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderBottomWidth =
    isLast || isBeforeOpen || isOpen ? BORDER_WIDTH : '0px';
  const borderLeftWidth = BORDER_WIDTH;
  const borderRightWidth = BORDER_WIDTH;

  let borderTopLeftRadius = 0;
  let borderTopRightRadius = 0;
  let borderBottomLeftRadius = 0;
  let borderBottomRightRadius = 0;

  if (isOpen || isAlone) {
    borderTopLeftRadius = 16;
    borderTopRightRadius = 16;
    borderBottomLeftRadius = 16;
    borderBottomRightRadius = 16;
  } else if (isBeforeOpen) {
    borderBottomLeftRadius = 16;
    borderBottomRightRadius = 16;
  } else if (isAfterOpen) {
    borderTopLeftRadius = 16;
    borderTopRightRadius = 16;
  } else if (isFirst) {
    borderTopLeftRadius = 16;
    borderTopRightRadius = 16;
  } else if (isLast) {
    borderBottomLeftRadius = 16;
    borderBottomRightRadius = 16;
  }

  return (
    <MotionConfig transition={springTransition}>
      <motion.li layout className="list-none">
        <motion.div
          animate={{
            borderTopLeftRadius,
            borderTopRightRadius,
            borderBottomLeftRadius,
            borderBottomRightRadius,
          }}
          className="overflow-hidden border-solid border-[#EFEAE2] bg-white will-change-transform transition-colors duration-200 shadow-2xs"
          style={{
            borderTopWidth,
            borderBottomWidth,
            borderLeftWidth,
            borderRightWidth,
            borderStyle: BORDER_STYLE,
            marginBlock: isOpen ? '12px' : '0px',
          }}
        >
          <button
            onClick={() => setOpenId(isOpen ? null : item.id)}
            className="flex w-full cursor-pointer items-center justify-between px-6 py-5 text-left group"
          >
            <div className="flex items-center gap-3.5">
              <span className="p-2 rounded-full bg-[#E10600]/10 text-[#E10600] group-hover:scale-110 transition-transform">
                {item.icon}
              </span>
              <span className="text-base font-serif font-semibold text-[#1E1E1E] group-hover:text-[#E10600] transition-colors tracking-wide">
                {item.title}
              </span>
            </div>

            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
              <ChevronDown className="size-5 text-[#E10600]" />
            </motion.div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: isOpen ? bounds.height : 0,
              opacity: isOpen ? 1 : 0,
            }}
            className="overflow-hidden will-change-transform"
          >
            <div ref={ref}>
              <div className="px-6 pb-6 pt-1 text-sm font-sans leading-relaxed text-[#555] border-t border-[#EFEAE2]">
                {item.content}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.li>
    </MotionConfig>
  );
};

export const AccordionApp: FC<AccordionProps> = ({ items }) => {
  const [openId, setOpenId] = useState<number | null>(null);
  const openIndex = items.findIndex((item) => item.id === openId);

  return (
    <div className="flex w-full flex-col items-center justify-center py-4">
      <ul className="w-full max-w-2xl space-y-0">
        {items.map((item, index) => (
          <AccordionItem
            key={item.id}
            item={item}
            setOpenId={setOpenId}
            index={index}
            total={items.length}
            openIndex={openIndex}
          />
        ))}
      </ul>
    </div>
  );
};

export default AccordionApp;
