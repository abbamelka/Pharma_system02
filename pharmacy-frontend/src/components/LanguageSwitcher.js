import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'am', name: 'አማርኛ', flag: '🇪🇹' },
    { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹' }
  ];

  const handleChange = (code) => {
    i18n.changeLanguage(code);
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Change language">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
          <TranslateIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        {languages.map((lang) => (
          <MenuItem
            key={lang.code}
            selected={i18n.language === lang.code}
            onClick={() => handleChange(lang.code)}
          >
            <span role="img" aria-label={lang.name} style={{ marginRight: 8 }}>
              {lang.flag}
            </span>
            {lang.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}