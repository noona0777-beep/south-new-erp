import { motion } from 'framer-motion';

/**
 * @desc حركات ظهور العناصر بشكل تدريجي للأعلى
 */
export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.4, ease: "easeOut" }
};

/**
 * @desc حركات ظهور العناصر من جهة اليمين
 */
export const fadeInRight = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.4, ease: "easeOut" }
};

/**
 * @desc تأثير وقوف الماوس على الأزرار (Hover) والضغط (Tap)
 */
export const buttonClick = {
    whileHover: { scale: 1.02, y: -2 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 }
};

/**
 * @desc تأثير الوقوف على البطاقات (Cards)
 */
export const cardHover = {
    whileHover: {
        y: -5,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
    },
    transition: { duration: 0.3 }
};

/**
 * @desc مكون جاهز للحاويات ذات الحركات التدريجية
 */
export const MotionDiv = ({ children, variants = fadeInUp, ...props }) => (
    <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        {...props}
    >
        {children}
    </motion.div>
);

/**
 * @desc حاوية للقوائم التي تظهر عناصرها بالتتابع (Staggered Children)
 */
export const StaggerContainer = ({ children, staggerValue = 0.1, ...props }) => {
    const container = {
        animate: {
            transition: {
                staggerChildren: staggerValue
            }
        }
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={container}
            {...props}
        >
            {children}
        </motion.div>
    );
};
