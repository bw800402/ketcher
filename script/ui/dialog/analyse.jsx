/****************************************************************************
 * Copyright 2017 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 ***************************************************************************/

import { range } from 'lodash/fp';

import { h, Component } from 'preact';
import { connect } from 'preact-redux';
/** @jsx h */

import keyName from 'w3c-keyname';
import Dialog from '../component/dialog';
import Input from '../component/input';

import { changeRound } from '../state/options';
import { analyse } from '../state/server';

function FrozenInput({value}) {
	return (
		<input type="text" spellCheck={false} value={value}
			   onKeyDown={ev => allowMovement(ev)}/>
	);
}

function FormulaInput({value}) {
	const content = [];
	const regExp = /\b([A-Z][a-z]{0,3})(\d*)\s*\b/g;
	var cnd;
	var pos = 0;
	while (cnd = regExp.exec(value)) {
		content.push(value.substring(pos, cnd.index) + cnd[1]);
		if (cnd[2].length > 0) content.push(<sub>{cnd[2]}</sub>);
		pos = cnd.index + cnd[0].length;
	}
	if (pos === 0) content.push(value);
	else content.push(value.substring(pos, value.length));
	return (
		<div className="chem-input" spellCheck={false} contentEditable={true}
			 onKeyDown={ev => allowMovement(ev)}>{content}</div>
	);
}

class Analyse extends Component {
	constructor(props) {
		super(props);
		props.onAnalyse();
	}

	render() {
		let { values, round, onAnalyse, onChangeRound, ...props } = this.props;

		return (
			<Dialog title="Calculated Values" className="analyse"
					buttons={["Close"]} params={props}>
				<ul>{[
					{ name: 'Chemical Formula', key: 'gross' },
					{ name: 'Molecular Weight', key: 'molecular-weight', round: 'roundWeight' },
					{ name: 'Exact Mass', key: 'monoisotopic-mass', round: 'roundMass' },
					{ name: 'Elemental Analysis', key: 'mass-composition' }
				].map(item => (
					<li>
						<label>{item.name}:</label>
						{item.key === 'gross'
							? <FormulaInput value={values ? values[item.key] : 0}/>
							: <FrozenInput value={values ? roundOff(values[item.key], round[item.round]) : 0}/>
						}
						{item.round
							? <Input schema={{
								enum: range(0, 8),
								enumNames: range(0, 8).map(i => `${i} decimal places`)
							}} value={round[item.round]} onChange={val => onChangeRound(item.round, val)}/>
							: null
						}
					</li>
				))
				}</ul>
			</Dialog>
		);
	}
}

function allowMovement(event) {
	const movementKeys = ['Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
	const key = keyName(event);

	if (movementKeys.indexOf(key) === -1)
		event.preventDefault();
}

function roundOff(value, round) {
	if (typeof value === 'number')
		return value.toFixed(round);

	return value.replace(/[0-9]*\.[0-9]+/g, (str) => (
		(+str).toFixed(round)
	));
}

export default connect(
	store => ({
		values: store.options.analyse.values,
		round: {
			roundWeight: store.options.analyse.roundWeight,
			roundMass: store.options.analyse.roundMass
		}
	}),
	dispatch => ({
		onAnalyse: () => dispatch(analyse()),
		onChangeRound: (roundName, val) => dispatch(changeRound(roundName, val))
	})
)(Analyse);